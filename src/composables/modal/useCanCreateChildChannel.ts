import useChannelPath from '/@/composables/useChannelPath'
import { nullUuid } from '/@/lib/basic/uuid'
import { canCreateChildChannel as canCreateChildChannel_ } from '/@/lib/channel'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

const useCanCreateChildChannel = () => {
  const { channelsMap } = useChannelsStore()
  const { channelIdToPathString } = useChannelPath()

  const canCreateChildChannel = (channelId: ChannelId) => {
    const path =
      channelId !== nullUuid ? (channelIdToPathString(channelId) ?? '') : ''
    const isArchived = channelsMap.value.get(channelId)?.archived ?? false
    return canCreateChildChannel_(path, isArchived)
  }

  return { canCreateChildChannel }
}

export default useCanCreateChildChannel
