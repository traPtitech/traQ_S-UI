import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useChannelSelect = () => {
  const onChannelSelect = (id: ChannelId) => {
    store.commit.app.setCurrentChannelId(id)
  }
  return {
    onChannelSelect
  }
}

export default useChannelSelect
