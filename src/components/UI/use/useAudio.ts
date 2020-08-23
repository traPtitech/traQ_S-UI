import { Ref, ref, computed } from '@vue/composition-api'
import usePictureInPicture from './usePictureInPicture'

const useAudio = (audioRef: Ref<HTMLAudioElement | null>) => {
  const isPlay = ref(false)
  const currentTime = ref(0)
  const displayCurrentTime = computed(() => setDisplayTime(currentTime))
  const duration = ref(0)
  const displayDuration = computed(() => setDisplayTime(duration))
  let isAddedEvent = false
  const volume = ref(1.0)

  const togglePlay = () => {
    // 更新処理を追加してないなら追加(refはreactiveでないため)
    if (!isAddedEvent && audioRef.value) {
      audioRef.value?.addEventListener('timeupdate', e => {
        currentTime.value = audioRef.value?.currentTime ?? 0
        if (duration.value === 0) {
          duration.value = audioRef.value?.duration ?? 0
        }
      })
      isAddedEvent = true
    }
    if (isPlay.value) {
      stop()
    } else {
      start()
    }
  }
  const start = () => {
    audioRef.value?.play()
    isPlay.value = true
  }
  const stop = () => {
    audioRef.value?.pause()
    isPlay.value = false
  }
  const changeVolume = (vol: number) => {
    if (audioRef.value) {
      audioRef.value.volume = vol / 100
      volume.value = vol / 100
    }
  }
  const changeTime = (time: number) => {
    if (audioRef.value && duration.value) {
      if (duration.value < time) return
      audioRef.value.currentTime = time
    }
  }
  const setDisplayTime = (time: Ref<number>) => {
    if (!Number.isFinite(time.value)) {
      return '0:00'
    }
    return `${Math.floor(time.value / 60)}:${(
      '' + Math.floor(time.value % 60)
    ).padStart(2, '0')}`
  }
  const startPinP = async (iconId: string) => {
    const { showPictureInPictureWindow } = usePictureInPicture()
    showPictureInPictureWindow(audioRef, iconId, duration, ct => {
      changeTime(ct)
      currentTime.value = ct
    })
  }
  return {
    isPlay,
    currentTime,
    displayCurrentTime,
    duration,
    displayDuration,
    volume,
    changeVolume,
    changeTime,
    togglePlay,
    startPinP
  }
}

export default useAudio
