import { computed, ref, unref } from 'vue'

import type { AxiosProgressEvent } from 'axios'

import useMessageInputStateStatic from '/@/composables/messageInputState/useMessageInputStateStatic'
import useChannelPath from '/@/composables/useChannelPath'
import apis, { buildFilePathForPost, formatResizeError } from '/@/lib/apis'
import { countLength } from '/@/lib/basic/string'
import { nilUuid } from '/@/lib/basic/uuid'
import { replace as embedInternalLink } from '/@/lib/markdown/internalLinkEmbedder'
import { isEmbeddedLink } from '/@/lib/markdown/markdown'
import { scheduledMessageApis } from '/@/lib/scheduledMessages'
import { MESSAGE_MAX_LENGTH } from '/@/lib/validate'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'
import type {
  Attachment,
  MessageInputStateKey
} from '/@/store/ui/messageInputStateStore'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'
import { useToastStore } from '/@/store/ui/toast'
import type { ChannelId } from '/@/types/entity-ids'

/**
 * @param progress アップロード進行状況 0～1
 */
type ProgressCallback = (progress: number) => void

const uploadAttachments = async (
  attachments: ReadonlyArray<Readonly<Attachment>>,
  channelId: ChannelId,
  onProgress: ProgressCallback,
  scheduled = false
) => {
  const responses = []
  for (const [i, attachment] of attachments.entries()) {
    const onUploadProgress = (e: AxiosProgressEvent) => {
      if (e.total === undefined || e.total === 0) return
      onProgress((i + e.loaded / e.total) / attachments.length)
    }
    responses.push(
      scheduled
        ? await scheduledMessageApis.upload(
            attachment.file,
            channelId,
            onUploadProgress
          )
        : await apis.postFile(attachment.file, channelId, {
            /**
             * https://github.com/axios/axios#request-config
             */
            onUploadProgress
          })
    )
  }
  return responses.map(res => res.data.id)
}

export const createContent = async (
  embeddedText: string,
  fileUrls: string[]
) => {
  const joinContents = (delimiter: string, contents: string[]) =>
    contents.filter(Boolean).join(delimiter)

  const embeddedUrls = fileUrls.join('\n')
  const trimmedEmbeddedText = embeddedText.trimEnd()

  if (trimmedEmbeddedText === '') {
    return joinContents('\n', [embeddedText, embeddedUrls])
  }

  const trimmedEmbeddedTextLines = trimmedEmbeddedText.split(`\n`)

  if (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await isEmbeddedLink(trimmedEmbeddedTextLines.at(-1)!)
  ) {
    return joinContents('\n', [trimmedEmbeddedText, embeddedUrls])
  }

  return joinContents('\n\n', [embeddedText, embeddedUrls])
}

const usePostMessage = (
  channelId: MessageInputStateKey,
  inputStateKey = channelId
) => {
  const { getMessageInputState } = useMessageInputStateStatic()
  const { channelPathStringToId, channelIdToShortPathString } = useChannelPath()
  const { addErrorToast, addSuccessToast } = useToastStore()
  const { postingChannels, getStore } = useMessageInputStateStore()
  const { bothChannelsMapInitialFetchPromise, channelsMap } = useChannelsStore()
  const { usersMapInitialFetchPromise, findUserByName } = useUsersStore()
  const { userGroupsMapInitialFetchPromise, getUserGroupByName } =
    useGroupsStore()

  const isForce = computed(() => channelsMap.value.get(unref(channelId))?.force)
  const confirmString = computed(
    () =>
      `${channelIdToShortPathString(
        unref(channelId),
        true
      )}に投稿されたメッセージは全員に通知されます。メッセージを投稿しますか？\n注) このチャンネルは重要な連絡以外には使用しないでください。`
  )

  const isPosting = computed(() =>
    postingChannels.value.has(unref(inputStateKey))
  )
  const progress = ref(0)

  const sendMessage = async (scheduledAt?: string) => {
    // awaitによって変化しないようにあえてリアクティブでないものを取得する
    const { state, isEmpty, clearState } = getMessageInputState(inputStateKey)
    // awaitの前でunrefしておかないと別のチャンネルに投稿されうる
    const cId = unref(channelId)
    const stateId = unref(inputStateKey)
    const text = state.text
    const attachments = [...state.attachments]

    if (isPosting.value || isEmpty) return false

    if (isForce.value && !confirm(confirmString.value)) {
      // 強制通知チャンネルでconfirmをキャンセルしたときは何もしない
      return false
    }

    postingChannels.value.add(stateId)
    let posted = false
    try {
      await Promise.all([
        usersMapInitialFetchPromise,
        userGroupsMapInitialFetchPromise,
        bothChannelsMapInitialFetchPromise
      ])

      const embeddedText = embedInternalLink(text, {
        getUser: findUserByName,
        getGroup: getUserGroupByName,
        getChannel: path => {
          try {
            const id = channelPathStringToId(path)
            return { id }
          } catch {
            return undefined
          }
        }
      })

      const dummyFileUrls = attachments.map(() => buildFilePathForPost(nilUuid))
      const dummyText = await createContent(embeddedText, dummyFileUrls)
      if (countLength(dummyText) > MESSAGE_MAX_LENGTH) {
        addErrorToast('メッセージが長すぎます')
        return
      }

      const fileIds = await uploadAttachments(
        attachments,
        cId,
        p => {
          progress.value = p
        },
        scheduledAt !== undefined
      )
      const content = await createContent(
        embeddedText,
        fileIds.map(buildFilePathForPost)
      )

      if (scheduledAt) {
        await scheduledMessageApis.create({
          channelId: cId,
          content,
          draftContent: text,
          scheduledAt,
          fileIds
        })
        addSuccessToast('投稿を予約しました')
      } else {
        await apis.postMessage(cId, { content })
      }

      // Other views may have edited the draft while this request was in flight.
      const current = getStore(stateId)
      if (
        current?.text === text &&
        current.attachments.length === attachments.length &&
        current.attachments.every((a, i) => a.file === attachments[i]?.file)
      ) {
        clearState()
      }
      posted = true
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('メッセージ送信に失敗しました', e)

      addErrorToast(
        formatResizeError(
          e,
          scheduledAt
            ? '予約に失敗しました。予約一覧を確認してください'
            : 'メッセージ送信に失敗しました'
        )
      )
    } finally {
      postingChannels.value.delete(stateId)
      progress.value = 0
    }
    return posted
  }
  return {
    postMessage: () => sendMessage(),
    scheduleMessage: (scheduledAt: string) => sendMessage(scheduledAt),
    isPosting,
    progress
  }
}

export default usePostMessage
