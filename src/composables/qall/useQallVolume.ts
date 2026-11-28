import { ref } from 'vue'

import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUserVolume } from '/@/store/app/userVolume'

/**
 * 通話中だけ有効な、参加者 (端末) ごとの音量
 *
 * キーは LiveKit の参加者の Identity。Identity は参加するたびに変わるので保存はせず、通話を抜けたら消す。
 * 同じユーザーが複数の端末で参加しているときに、端末ごとに音量を変えるのに使う。
 */
const participantVolumes = ref(new Map<string, number>())

export const clearParticipantVolumes = () => {
  participantVolumes.value.clear()
}

type VolumeTarget = Pick<TrackInfo, 'userName' | 'identity'>

export const useQallVolume = () => {
  const { getStore, setStore } = useUserVolume()

  /**
   * 参加者の音量 (端末ごとの音量 → ユーザーごとの保存された音量 → 1 の順)
   */
  const getVolume = (target: VolumeTarget): number =>
    participantVolumes.value.get(target.identity) ??
    getStore(target.userName) ??
    1

  /**
   * 参加者の音量を設定する
   *
   * @param perDevice true のときはこの端末だけの音量として通話中のみ覚える。
   *   false のときはユーザーの音量として保存する
   */
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
