import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { wsListener } from '/@/lib/websocket'
import { ChannelSubscribersChangedEvent } from '/@/lib/websocket/events'
import { ChannelId } from '/@/types/entity-ids'
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'

const getChannelSubscribers = createSingleflight(
  apis.getChannelSubscribers.bind(apis)
)

/**
 * 閲覧中のチャンネルでないとwsからのイベントが来ないため変化しないので注意
 */
const useChannelSubscribers = (props: { channelId: ChannelId }) => {
  const subscribers = ref(new Set<string>())

  const fetch = async () => {
    try {
      const [res] = await getChannelSubscribers(props.channelId)
      subscribers.value = new Set(res.data)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      subscribers.value = new Set()
    }
  }

  // 表示されたまたはチャンネルが変わったとき
  watchEffect(() => {
    fetch()
  })

  const onSubscribersChanged = ({ id }: ChannelSubscribersChangedEvent) => {
    if (id !== props.channelId) return
    fetch()
  }

  onMounted(() => {
    wsListener.on('reconnect', fetch)
    wsListener.on('CHANNEL_SUBSCRIBERS_CHANGED', onSubscribersChanged)
  })

  onBeforeUnmount(() => {
    wsListener.off('reconnect', fetch)
    wsListener.off('CHANNEL_SUBSCRIBERS_CHANGED', onSubscribersChanged)
  })

  return subscribers
}

export default useChannelSubscribers
