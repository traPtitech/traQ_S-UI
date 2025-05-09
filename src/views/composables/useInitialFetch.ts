import { ref } from 'vue'
import useLoginCheck from './useLoginCheck'
import { useUsersStore } from '/@/store/entities/users'
import { useGroupsStore } from '/@/store/entities/groups'
import { useChannelsStore } from '/@/store/entities/channels'
import { useStampsStore } from '/@/store/entities/stamps'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import { useViewStatesStore } from '/@/store/domain/viewStates'
import { useSubscriptionStore } from '/@/store/domain/subscription'

// TODO: Qall

const useInitialFetch_ = () => {
  const { fetchUsers } = useUsersStore()
  const { fetchUserGroups } = useGroupsStore()
  const { fetchChannels } = useChannelsStore()
  const { fetchStamps } = useStampsStore()
  const { fetchStampPalettes } = useStampPalettesStore()
  const { fetchClipFolders } = useClipFoldersStore()
  const { fetchUnreadChannels, fetchSubscriptions } = useSubscriptionStore()
  const { fetchViewStates } = useViewStatesStore()
  const { fetchStampHistory } = useStampHistory()
  const { fetchStaredChannels } = useStaredChannels()
  return () => {
    // 初回fetch
    fetchUsers()
    fetchUserGroups()
    fetchChannels()
    fetchStamps()

    fetchUnreadChannels()
    fetchSubscriptions()
    fetchViewStates()

    fetchStampHistory()
    fetchStampPalettes()

    fetchStaredChannels()
    fetchClipFolders()
  }
}

const useInitialFetch = (afterLoginCheck: () => void) => {
  const initialFetch = useInitialFetch_()
  const initialFetchCompleted = ref(false)

  useLoginCheck(() => {
    if (initialFetchCompleted.value) return

    initialFetchCompleted.value = true
    initialFetch()
    afterLoginCheck()
  })
}

export default useInitialFetch
