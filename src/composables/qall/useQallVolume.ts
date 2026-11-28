import { ref } from 'vue'

import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUserVolume } from '/@/store/app/userVolume'

const participantVolumes = ref(new Map<string, number>())

export const clearParticipantVolumes = () => {
  participantVolumes.value.clear()
}

type VolumeTarget = Pick<TrackInfo, 'userName' | 'identity'>

export const useQallVolume = () => {
  const { getStore, setStore } = useUserVolume()

  const getVolume = (target: VolumeTarget): number =>
    participantVolumes.value.get(target.identity) ??
    getStore(target.userName) ??
    1

  const setVolume = (
    target: VolumeTarget,
    volume: number,
    { perDevice }: { perDevice: boolean }
  ) => {
    if (perDevice) {
      participantVolumes.value.set(target.identity, volume)
      return
    }
    participantVolumes.value.delete(target.identity)
    setStore(target.userName, volume)
  }

  return { getVolume, setVolume }
}
