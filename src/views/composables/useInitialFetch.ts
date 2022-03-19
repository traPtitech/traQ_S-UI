import { ref } from 'vue'
import useLoginCheck from './useLoginCheck'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useMeStore } from '/@/store/domain/me'
import { useUsersStore } from '/@/store/entities/users'
import { useGroupsStore } from '/@/store/entities/groups'
import { useChannelsStore } from '/@/store/entities/channels'
import { useStampsStore } from '/@/store/entities/stamps'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import { useViewStatesStore } from '/@/store/domain/viewStates'

const useInitialFetch_ = () => {
  const { fetchUsers } = useUsersStore()
  const { fetchUserGroups } = useGroupsStore()
  const { fetchChannels } = useChannelsStore()
  const { fetchStamps } = useStampsStore()
  const { fetchStampPalettes } = useStampPalettesStore()
  const { fetchClipFolders } = useClipFoldersStore()
  const { fetchUnreadChannels, fetchSubscriptions } = useMeStore()
  const { fetchViewStates } = useViewStatesStore()
  const { fetchStampHistory } = useStampHistory()
  const { fetchStaredChannels } = useStaredChannels()
  const { fetchRTCState } = useDomainRtcStore()
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
    fetchRTCState()
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
