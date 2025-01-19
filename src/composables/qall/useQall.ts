import { ref } from 'vue'
import { useLiveKitSDK } from '/@/composables/qall/useLiveKitSDK'
import { useMeStore } from '/@/store/domain/me'
import { useToastStore } from '/@/store/ui/toast'

const isCalling = ref(false)
const { joinRoom, leaveRoom, addScreenShareTrack, tracksMap } = useLiveKitSDK()
const { myId } = useMeStore()
const { addErrorToast } = useToastStore()
export const useQall = () => {
  const toggleCalling = (channelName: string) => {
    if (isCalling.value) {
      leaveRoom()
    } else {
      if (!myId.value) {
        addErrorToast('接続に失敗しました')
        return
      }
      joinRoom('test', myId.value)
    }
    isCalling.value = !isCalling.value
  }
  return {
    isCalling,
    toggleCalling,
    tracksMap
  }
}
