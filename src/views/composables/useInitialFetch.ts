import { ref } from 'vue'

import { useRoomsStore } from '/@/store/domain/rooms'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useViewStatesStore } from '/@/store/domain/viewStates'
import { useChannelsStore } from '/@/store/entities/channels'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import useLoginCheck from './useLoginCheck'

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
  const { fetchStampRecommendations } = useStampRecommendations()
  const { fetchStaredChannels } = useStaredChannels()
  const { fetchRooms } = useRoomsStore()

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
    fetchStampRecommendations()
    fetchStampPalettes()

    fetchStaredChannels()
    fetchClipFolders()

    fetchRooms()
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
