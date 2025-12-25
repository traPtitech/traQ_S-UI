import apis from '/@/lib/apis'
import type { ChannelId } from '/@/types/entity-ids'

const useStarChannel = (props: { channelId: ChannelId }) => {
  const starChannel = async () => {
    await apis.addMyStar({ channelId: props.channelId })
  }
  const unstarChannel = async () => {
    await apis.removeMyStar(props.channelId)
  }
  return { starChannel, unstarChannel }
}

export default useStarChannel
