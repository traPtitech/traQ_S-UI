import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import type { MessageId, ClipFolderId } from '/@/types/entity-ids'
import type { Ref, ShallowRef } from 'vue'
import { reactive, watch, onMounted, computed } from 'vue'
import useFetchLimit from '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit'
import { wsListener } from '/@/lib/websocket'
import { useMessagesStore } from '/@/store/entities/messages'
import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'
import type { MessageScrollerInstance } from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'

/** 一つのメッセージの最低の高さ (CSSに依存) */
const MESSAGE_HEIGHT = 80

interface GetClipsParam {
  folderId: string
  limit?: number
  offset?: number
  order?: 'asc' | 'desc'
}

const useClipsFetcher = (
  scrollerRef: ShallowRef<MessageScrollerInstance | undefined>,
  props: {
    clipFolderId: ClipFolderId
    entryMessageId?: MessageId
  }
) => {
  const { fetchMessage, extendMessagesMap } = useMessagesStore()
  const { fetchLimit, waitHeightResolved } = useFetchLimit(
    scrollerRef,
    MESSAGE_HEIGHT
  )
  const state = reactive({
    nextLoadOffset: 0
  })

  const reset = () => {
    messagesFetcher.reset()
    state.nextLoadOffset = 0
  }
  const init = () => {
    messagesFetcher.init()
  }

  const fetchMessagesInClipFolder = async (params: GetClipsParam) => {
    const { data, headers } = await apis.getClips(
      params.folderId,
      params.limit,
      params.offset,
      params.order
    )
    extendMessagesMap(data.map(c => c.message))
    return {
      clips: data,
      hasMore: headers['x-traq-more'] === 'true'
    }
  }

  const fetchFormerMessages = async (isReachedEnd: Ref<boolean>) => {
    await waitHeightResolved
    const { clips, hasMore } = await fetchMessagesInClipFolder({
      folderId: props.clipFolderId,
      limit: fetchLimit.value,
      offset: state.nextLoadOffset
    })

    if (!hasMore) {
      isReachedEnd.value = true
    } else {
      state.nextLoadOffset += fetchLimit.value
    }

    return clips.toReversed().map(clip => clip.message.id)
  }

  const messagesFetcher = useMessageFetcher(
    {},
    computed(() => `cf:${props.clipFolderId}`),
    fetchFormerMessages,
    undefined,
    undefined,
    undefined
  )

  onMounted(() => {
    reset()
    init()
  })
  watch(
    () => props.clipFolderId,
    (newVal, oldVal) => {
      if (newVal === oldVal) {
        return
      }
      reset()
      init()
    }
  )

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
