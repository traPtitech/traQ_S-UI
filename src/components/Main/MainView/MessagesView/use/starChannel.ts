import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useStarChannel = (props: { channelId: ChannelId }) => {
  const starChannel = () => {
    store.dispatch.domain.me.starChannel(props.channelId)
  }
  const unstarChannel = () => {
    store.dispatch.domain.me.unstarChannel(props.channelId)
  }
  return { starChannel, unstarChannel }
}

export default useStarChannel
