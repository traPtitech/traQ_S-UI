import useChannelPath from '/@/use/channelPath'
import { canCreateChildChannel as canCreateChildChannel_ } from '/@/lib/channel'
import { ChannelId } from '/@/types/entity-ids'
import store from '/@/store'
import { nullUuid } from '/@/lib/basic/uuid'

const useCanCreateChildChannel = () => {
  const { channelIdToPathString } = useChannelPath()

  const canCreateChildChannel = (channelId: ChannelId) => {
    const path = channelId !== nullUuid ? channelIdToPathString(channelId) : ''
    const isArchived =
      store.state.entities.channelsMap.get(channelId)?.archived ?? false
    return canCreateChildChannel_(path, isArchived)
  }

  return { canCreateChildChannel }
}

export default useCanCreateChildChannel
