import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { wsListener } from '/@/lib/websocket'
import type { ChannelId } from '/@/types/entity-ids'
import { ref, watchEffect } from 'vue'
import useMittListener from '/@/composables/utils/useMittListener'

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
      subscribers.value.clear()
    }
  }

  // 表示されたまたはチャンネルが変わったとき
  watchEffect(() => {
    fetch()
  })

  useMittListener(wsListener, 'CHANNEL_SUBSCRIBERS_CHANGED', ({ id }) => {
    if (id !== props.channelId) return
    fetch()
  })
  useMittListener(wsListener, 'reconnect', fetch)

  return subscribers
}

export default useChannelSubscribers
