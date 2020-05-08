import { ChannelId, DMChannelId } from '@/types/entity-ids'
import { changeChannelById } from '@/router/channel'

const useChannelSelect = () => {
  const onChannelSelect = (id: ChannelId | DMChannelId) => {
    try {
      changeChannelById(id)
    } catch {
      throw 'Invalid Channel'
    }
  }

  return {
    onChannelSelect
  }
}

export default useChannelSelect
