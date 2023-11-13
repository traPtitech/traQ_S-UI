import type { ChannelId } from '/@/types/entity-ids'
import apis, { buildFilePathForPost, formatResizeError } from '/@/lib/apis'
import { replace as embedInternalLink } from '/@/lib/markdown/internalLinkEmbedder'
import useChannelPath from '/@/composables/useChannelPath'
import { computed, ref, unref } from 'vue'
import { nullUuid } from '/@/lib/basic/uuid'
import { MESSAGE_MAX_LENGTH } from '/@/lib/validate'
import { countLength } from '/@/lib/basic/string'
import { useToastStore } from '/@/store/ui/toast'
import type {
  Attachment,
  MessageInputStateKey
} from '/@/store/ui/messageInputStateStore'
import useMessageInputStateStatic from '/@/composables/messageInputState/useMessageInputStateStatic'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import { useGroupsStore } from '/@/store/entities/groups'
import type { AxiosProgressEvent } from 'axios'

/**
 * @param progress アップロード進行状況 0～1
 */
type ProgressCallback = (progress: number) => void

const uploadAttachments = async (
  attachments: ReadonlyArray<Readonly<Attachment>>,
  channelId: ChannelId,
  onProgress: ProgressCallback
) => {
  const responses = []
  for (const [i, attachment] of attachments.entries()) {
    responses.push(
      await apis.postFile(attachment.file, channelId, {
        /**
         * https://github.com/axios/axios#request-config
         */
        onUploadProgress(e: AxiosProgressEvent) {
          if (e.total === undefined || e.total === 0) return
          onProgress((i + e.loaded / e.total) / attachments.length)
        }
      })
    )
  }
  return responses.map(res => buildFilePathForPost(res.data.id))
}

const createContent = (embededText: string, fileUrls: string[]) => {
  const embededUrls = fileUrls.join('\n')
  return embededText + (embededText && embededUrls ? '\n\n' : '') + embededUrls
}

const usePostMessage = (
  channelId: MessageInputStateKey,
  inputStateKey = channelId
) => {
  const { getMessageInputState } = useMessageInputStateStatic()
  const { channelPathToId, channelIdToShortPathString } = useChannelPath()
  const { addErrorToast } = useToastStore()
  const { channelTree } = useChannelTree()
  const { bothChannelsMapInitialFetchPromise, channelsMap } = useChannelsStore()
  const { usersMapInitialFetchPromise, findUserByName } = useUsersStore()
  const { userGroupsMapInitialFetchPromise, getUserGroupByName } =
    useGroupsStore()

  const isForce = computed(() => channelsMap.value.get(unref(channelId))?.force)
  const confirmString = computed(
    () =>
      `#${channelIdToShortPathString(
        unref(channelId)
      )}に投稿されたメッセージは全員に通知されます。メッセージを投稿しますか？\n注) このチャンネルは重要な連絡以外には使用しないでください。`
  )

  const isPosting = ref(false)
  const progress = ref(0)

  const postMessage = async () => {
    // awaitによって変化しないようにあえてリアクティブでないものを取得する
    const { state, isEmpty, clearState } = getMessageInputState(inputStateKey)
    // awaitの前でunrefしておかないと別のチャンネルに投稿されうる
    const cId = unref(channelId)

    if (isPosting.value || isEmpty) return false

    if (isForce.value && !confirm(confirmString.value)) {
      // 強制通知チャンネルでconfirmをキャンセルしたときは何もしない
      return false
    }

    await Promise.all([
      usersMapInitialFetchPromise.value,
      userGroupsMapInitialFetchPromise.value,
      bothChannelsMapInitialFetchPromise.value
    ])

    const embededText = embedInternalLink(state.text, {
      getUser: findUserByName,
      getGroup: getUserGroupByName,
      getChannel: path => {
        try {
          const id = channelPathToId(path.split('/'), channelTree.value)
          return { id }
        } catch {
          return undefined
        }
      }
    })

    const dummyFileUrls = state.attachments.map(() =>
      buildFilePathForPost(nullUuid)
    )
    const dummyText = createContent(embededText, dummyFileUrls)
    if (countLength(dummyText) > MESSAGE_MAX_LENGTH) {
      addErrorToast('メッセージが長すぎます')
      return
    }

    let posted = false
    try {
      isPosting.value = true

      const fileUrls = await uploadAttachments(state.attachments, cId, p => {
        progress.value = p
      })

      await apis.postMessage(cId, {
        content: createContent(embededText, fileUrls)
      })

      clearState()
      posted = true
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('メッセージ送信に失敗しました', e)

      addErrorToast(formatResizeError(e, 'メッセージ送信に失敗しました'))
    } finally {
      isPosting.value = false
      progress.value = 0
    }
    return posted
  }
  return { postMessage, isPosting, progress }
}

export default usePostMessage
