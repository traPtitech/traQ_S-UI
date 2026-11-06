import type { ShallowRef } from 'vue'

import useFetchLimit from '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit'
import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import type { MessageScrollerInstance } from '/@/components/Main/MainView/MessagesScroller/types'
import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import type { ClipFolderId } from '/@/types/entity-ids'

const MESSAGE_HEIGHT = 80

const useClipsFetcher = (
  scrollerRef: ShallowRef<MessageScrollerInstance | undefined>,
  props: { clipFolderId: ClipFolderId }
) => {
  const { fetchLimit, waitHeightResolved } = useFetchLimit(
    scrollerRef,
    MESSAGE_HEIGHT
  )

  const messagesFetcher = useMessageFetcher({
    source: () => props.clipFolderId,
    initialCursor: () => 0,
    ready: waitHeightResolved,
    limit: fetchLimit,

    load: {
      older: async ({ source, cursor, limit, signal }) => {
        const { data, headers } = await apis.getClips(
          source,
          limit,
          cursor,
          undefined,
          { signal }
        )

        return {
          messages: data.toReversed().map(clip => clip.message),
          cursor: cursor + limit,
          reachedStart: headers['x-traq-more'] !== 'true'
        }
      }
    }
  })

  // クリップフォルダは再接続時の差分取得ができないためイベントのみ反映する。
  useMittListener(
    wsListener,
    'CLIP_FOLDER_MESSAGE_ADDED',
    ({ folder_id, message_id }) => {
      if (props.clipFolderId === folder_id)
        void messagesFetcher.addNewMessage(message_id)
    }
  )

  useMittListener(
    wsListener,
    'CLIP_FOLDER_MESSAGE_DELETED',
    ({ folder_id, message_id }) => {
      if (props.clipFolderId === folder_id)
        messagesFetcher.removeMessage(message_id)
    }
  )

  return messagesFetcher
}

export default useClipsFetcher
