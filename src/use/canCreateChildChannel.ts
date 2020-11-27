import useChannelPath from '@/use/channelPath'
import { canCreateChildChannel as canCreateChildChannel_ } from '@/lib/channel'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'

const useCanCreateChildChannel = () => {
  const { channelIdToPathString } = useChannelPath()

  const canCreateChildChannel = (channelId: ChannelId) => {
    const path = channelIdToPathString(channelId)
    const isArchived =
      store.state.entities.channels[channelId]?.archived ?? false
    return canCreateChildChannel_(path, isArchived)
  }

  return { canCreateChildChannel }
}

export default useCanCreateChildChannel
