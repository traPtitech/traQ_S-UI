import { ChannelId } from '/@/types/entity-ids'
import store from '/@/store'
import apis, { buildFilePathForPost, formatResizeError } from '/@/lib/apis'
import { replace as embedInternalLink } from '/@/lib/markdown/internalLinkEmbedder'
import useChannelPath from '/@/use/channelPath'
import { computed, ref, unref } from 'vue'
import { nullUuid } from '/@/lib/basic/uuid'
import { MESSAGE_MAX_LENGTH } from '/@/lib/validate'
import { countLength } from '/@/lib/basic/string'
import {
  usersMapInitialFetchPromise,
  userGroupsMapInitialFetchPromise,
  bothChannelsMapInitialFetchPromise
} from '/@/store/entities/promises'
import useToastStore from '/@/providers/toastStore'
import {
  Attachment,
  useMessageInputStateStatic,
  MessageInputStateKey
} from '/@/providers/messageInputState'

const initialFetchPromise = Promise.all([
  usersMapInitialFetchPromise,
  userGroupsMapInitialFetchPromise,
  bothChannelsMapInitialFetchPromise
])

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
        onUploadProgress(e: ProgressEvent) {
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

  const isForce = computed(
    () => store.state.entities.channelsMap.get(unref(channelId))?.force
  )
  const confirmString = computed(
    () =>
      `#${channelIdToShortPathString(
        unref(channelId)
      )}に投稿されたメッセージは全員に通知されます。メッセージを投稿しますか？`
  )

  const isPosting = ref(false)
  const progress = ref(0)

  const postMessage = async () => {
    // awaitによって変化しないようにあえてリアクティブでないものを取得する
    const { state, isEmpty, clearState } = getMessageInputState(inputStateKey)
    // awaitの前でunrefしておかないと別のチャンネルに投稿されうる
    const cId = unref(channelId)

    if (isPosting.value || isEmpty.value) return false

    if (isForce.value && !confirm(confirmString.value)) {
      // 強制通知チャンネルでconfirmをキャンセルしたときは何もしない
      return false
    }

    await initialFetchPromise

    const embededText = embedInternalLink(state.text, {
      getUser: store.getters.entities.userByName,
      getGroup: store.getters.entities.userGroupByName,
      getChannel: path => {
        try {
          const id = channelPathToId(
            path.split('/'),
            store.state.domain.channelTree.channelTree
          )
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
