import useChannelPath from '/@/composables/useChannelPath'
import { canCreateChildChannel as canCreateChildChannel_ } from '/@/lib/channel'
import { ChannelId } from '/@/types/entity-ids'
import { nullUuid } from '/@/lib/basic/uuid'
import { useChannelsStore } from '/@/store/entities/channels'

const useCanCreateChildChannel = () => {
  const { channelsMap } = useChannelsStore()
  const { channelIdToPathString } = useChannelPath()

  const canCreateChildChannel = (channelId: ChannelId) => {
    const path = channelId !== nullUuid ? channelIdToPathString(channelId) : ''
    const isArchived = channelsMap.value.get(channelId)?.archived ?? false
    return canCreateChildChannel_(path, isArchived)
  }

  return { canCreateChildChannel }
}

export default useCanCreateChildChannel
