import { computed, onMounted, watch } from 'vue'

import useFetchLimit, {
  type MessageScrollerRef
} from '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit'
import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { useMessagesStore } from '/@/store/entities/messages'
import type { ClipFolderId, MessageId } from '/@/types/entity-ids'

/** 一つのメッセージの最低の高さ (CSSに依存) */
const MESSAGE_HEIGHT = 80

const useClipsFetcher = (
  scrollerRef: MessageScrollerRef,
  props: {
    clipFolderId: ClipFolderId
    entryMessageId?: MessageId
  }
) => {
  const { fetchMessage } = useMessagesStore()
  const getFetchLimit = useFetchLimit(scrollerRef, MESSAGE_HEIGHT)
  let nextLoadOffset = 0

  const fetchFormerMessages = async () => {
    const { clipFolderId } = props
    const offset = nextLoadOffset
    const limit = await getFetchLimit()
    const { data, headers } = await apis.getClips(clipFolderId, limit, offset)
    const hasMore = headers['x-traq-more'] === 'true'

    return {
      messages: data.toReversed().map(clip => clip.message),
      isReachedEnd: !hasMore,
      nextOffset: hasMore ? offset + limit : offset
    }
  }

  const messagesFetcher = useMessageFetcher(
    {},
    computed(() => `cf:${props.clipFolderId}`),
    {
      fetchFormerMessages,
      applyPagination: page => {
        nextLoadOffset = page.nextOffset
      }
    }
  )

  const initialize = () => {
    nextLoadOffset = 0
    messagesFetcher.reset()
    return messagesFetcher.init()
  }

  onMounted(initialize)
  watch(() => props.clipFolderId, initialize)

  // クリップフォルダは、wsの再接続時にうまく取得ができないので、
  // 自動で再取得するのはあきらめる
  useMittListener(
    wsListener,
    'CLIP_FOLDER_MESSAGE_ADDED',
    async ({ folder_id, message_id }) => {
      if (props.clipFolderId !== folder_id) return

      await fetchMessage({
        messageId: message_id
      })
      messagesFetcher.addNewMessage(message_id)
    }
  )
  useMittListener(
    wsListener,
    'CLIP_FOLDER_MESSAGE_DELETED',
    ({ folder_id, message_id }) => {
      if (props.clipFolderId !== folder_id) return

      const index = messagesFetcher.messageIds.value.indexOf(message_id)
      if (index === -1) return
      messagesFetcher.messageIds.value.splice(index, 1)
    }
  )

  return messagesFetcher
}

export default useClipsFetcher
