import { ref, watch } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import apis from '@/lib/apis'
import { ChannelEvent } from '@traptitech/traq'

const useChannelEvents = (props: { channelId: ChannelId }) => {
  const events = ref<ChannelEvent[]>([])

  watch(
    () => props.channelId,
    async newChannelId => {
      const { data } = await apis.getChannelEvents(newChannelId)
      events.value = data
    },
    { immediate: true }
  )

  return { events }
}

export default useChannelEvents
