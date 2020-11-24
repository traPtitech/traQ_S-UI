import { Ref, ref, computed, watch } from 'vue'
import usePictureInPicture from './pictureInPicture'
import { FileInfo } from '@traptitech/traq'

const getDisplayTime = (time: number) => {
  if (!Number.isFinite(time)) {
    return '0:00'
  }
  const min = Math.floor(time / 60)
  const sec = ('' + Math.floor(time % 60)).padStart(2, '0')
  return `${min}:${sec}`
}

const toFinite = (n: number, def: number) => (Number.isFinite(n) ? n : def)

const useAudio = (
  fileMeta: Ref<FileInfo | undefined>,
  fileRawPath: Ref<string>
) => {
  const { isPinPShown, showPictureInPictureWindow } = usePictureInPicture()

  const audio = new Audio()

  const cantPlay = computed(
    () => fileMeta.value && audio.canPlayType(fileMeta.value.mime) === ''
  )
  const wasUnsupportedType = ref(false)

  watch(
    () => fileMeta.value?.mime + fileRawPath.value,
    () => {
      if (audio.canPlayType(fileMeta.value?.mime ?? '')) {
        audio.src = fileRawPath.value
      }
    },
    { immediate: true }
  )

  const isPlaying = ref(false)
  audio.addEventListener('play', () => {
    isPlaying.value = true
  })
  audio.addEventListener('pause', () => {
    isPlaying.value = false
  })
  audio.addEventListener('ended', () => {
    isPlaying.value = false
  })
  audio.addEventListener('emptied', () => {
    isPlaying.value = false
  })
  const togglePlay = async () => {
    if (isPlaying.value) {
      pause()
    } else {
      await start()
    }
  }
  const start = async () => {
    try {
      await audio.play()
    } catch (e: unknown) {
      const err = e as Error
      if (err.name === 'NotSupportedError') {
        wasUnsupportedType.value = true
      }
    }
  }
  const pause = () => {
    audio.pause()
  }

  const currentTime = ref(toFinite(audio.currentTime, 0))
  audio.addEventListener('timeupdate', () => {
    currentTime.value = toFinite(audio.currentTime, 0)
  })
  const displayCurrentTime = computed(() => getDisplayTime(currentTime.value))
  const changeTime = (time: number) => {
    audio.currentTime = time
  }

  const duration = ref(toFinite(audio.duration, 0))
  audio.addEventListener('loadedmetadata', () => {
    duration.value = toFinite(audio.duration, 0)
  })
  const displayDuration = computed(() => getDisplayTime(duration.value))

  const volume = ref(toFinite(audio.volume, 1))
  audio.addEventListener('volumechange', () => {
    volume.value = toFinite(audio.volume, 1)
  })
  const changeVolume = (vol: number) => {
    audio.volume = vol / 100
  }

  const startPinP = (iconId: string) => {
    showPictureInPictureWindow(audio, iconId)
  }
  return {
    cantPlay,
    wasUnsupportedType,
    isPlaying,
    currentTime,
    displayCurrentTime,
    duration,
    displayDuration,
    volume,
    changeVolume,
    changeTime,
    togglePlay,
    isPinPShown,
    startPinP
  }
}

export default useAudio
