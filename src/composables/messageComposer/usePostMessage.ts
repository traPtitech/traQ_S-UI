import { type Ref, computed, ref, unref } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import apis, {
  buildFilePathForPost,
  embeddingOrigin,
  formatResizeError
} from '/@/lib/apis'
import { countLength } from '/@/lib/basic/string'
import { nilUuid } from '/@/lib/basic/uuid'
import {
  createMessageContentBuilder,
  normalizeMessageSource
} from '/@/lib/message/content'
import { uploadAttachments } from '/@/lib/message/uploadAttachments'
import { MESSAGE_MAX_LENGTH } from '/@/lib/validate'
import { useChannelsStore } from '/@/store/entities/channels'
import type { MessageInputStateKey } from '/@/store/ui/messageInputStateStore'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'
import { useToastStore } from '/@/store/ui/toast'
import type { ChannelId } from '/@/types/entity-ids'

const usePostMessage = (
  channelId: ChannelId | Ref<ChannelId>,
  draftKey: MessageInputStateKey = channelId
) => {
  const { captureDraftSnapshot, consumeSnapshot } = useMessageInputStateStore()
  const { channelIdToShortPathString } = useChannelPath()
  const { addErrorToast } = useToastStore()
  const { channelsMap } = useChannelsStore()

  const isForce = computed(() => channelsMap.value.get(unref(channelId))?.force)

  const confirmString = computed(
    () =>
      `${channelIdToShortPathString(
        unref(channelId),
        true
      )}に投稿されたメッセージは全員に通知されます。メッセージを投稿しますか？\n注) このチャンネルは重要な連絡以外には使用しないでください。`
  )

  const isPosting = ref(false)
  const progress = ref(0)

  const postMessage = async () => {
    // awaitによって変化しないようにあえてリアクティブでないものを取得する
    const snapshot = captureDraftSnapshot(draftKey)
    const { state, isEmpty } = snapshot
    // awaitの前でunrefしておかないと別のチャンネルに投稿されうる
    const cId = unref(channelId)

    if (isPosting.value || isEmpty) return false

    if (isForce.value && !confirm(confirmString.value)) {
      // 強制通知チャンネルでconfirmをキャンセルしたときは何もしない
      return false
    }

    isPosting.value = true
    let posted = false

    try {
      // 確定済みの参照を保ち、プレーンテキストを送信時に名前解決しない。
      const createContent = createMessageContentBuilder(
        normalizeMessageSource(state.text),
        embeddingOrigin
      )

      const dummyFileUrls = state.attachments.map(() =>
        buildFilePathForPost(nilUuid)
      )

      const dummyText = createContent(dummyFileUrls)

      if (countLength(dummyText) > MESSAGE_MAX_LENGTH) {
        addErrorToast('メッセージが長すぎます')
        return false
      }

      const fileUrls = await uploadAttachments(
        state.attachments.map(attachment => attachment.file),
        cId,
        p => {
          progress.value = p
        }
      )

      await apis.postMessage(cId, {
        content: createContent(fileUrls)
      })

      consumeSnapshot(snapshot)
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
