import { ref } from 'vue'
import useLoginCheck from './loginCheck'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useMeStore } from '/@/store/domain/me'
import { useUsersStore } from '/@/store/entities/users'
import { useGroupsStore } from '/@/store/entities/groups'
import { useChannelsStore } from '/@/store/entities/channels'
import { useStampsStore } from '/@/store/entities/stamps'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

const useInitialFetch_ = () => {
  const { fetchUsers } = useUsersStore()
  const { fetchUserGroups } = useGroupsStore()
  const { fetchChannels } = useChannelsStore()
  const { fetchStamps } = useStampsStore()
  const { fetchStampPalettes } = useStampPalettesStore()
  const { fetchClipFolders } = useClipFoldersStore()
  const {
    fetchUnreadChannels,
    fetchSubscriptions,
    fetchViewStates,
    fetchStampHistory,
    fetchStaredChannels
  } = useMeStore()
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
