import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useChannelArchiveCheck = () => {
  const filterNotArchive = (cid: ChannelId) =>
    !store.state.entities.channels[cid].archived
  return { filterNotArchive }
}

export default useChannelArchiveCheck
