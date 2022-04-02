import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import apis from '/@/lib/apis'
import type { ChannelEvent } from '@traptitech/traq'
import { throttle } from 'throttle-debounce'

const FETCH_LIMIT = 50
const FETCH_NEXT_BOTTOM_HEIGHT = 100

const useChannelEvents = (
  props: { channelId: ChannelId },
  containerEle: Ref<HTMLElement | undefined>
) => {
  const events = ref<ChannelEvent[]>([])
  let fetching = false
  let hasMore = true
  let nextOffset = 0

  const fetch = async (channelId: ChannelId, offset = 0, force = false) => {
    if (fetching && !force) return

    fetching = true
    const { data, headers } = await apis.getChannelEvents(
      channelId,
      FETCH_LIMIT,
      offset
    )

    if (offset === 0) {
      events.value = data
    } else {
      events.value.push(...data)
    }
    hasMore = headers['x-traq-more'] === 'true'
    nextOffset = offset + FETCH_LIMIT

    fetching = false
  }

  watch(
    () => props.channelId,
    newChannelId => {
      fetch(newChannelId, 0, true)
    },
    { immediate: true }
  )

  const onScroll = throttle(100, () => {
    if (!containerEle.value) return
    if (!hasMore) return

    const scrollBottom =
      containerEle.value.scrollTop + containerEle.value.clientHeight
    if (
      containerEle.value.scrollHeight - scrollBottom <
      FETCH_NEXT_BOTTOM_HEIGHT
    ) {
      fetch(props.channelId, nextOffset)
    }
  })

  return { events, onScroll }
}

export default useChannelEvents
