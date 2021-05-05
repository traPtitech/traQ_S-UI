import {
  Ref,
  ref,
  computed,
  watch,
  readonly,
  unref,
  isRef,
  onMounted
} from 'vue'
import usePictureInPicture from './pictureInPicture'
import { FileInfo } from '@traptitech/traq'

const toFinite = (n: number, def: number) => (Number.isFinite(n) ? n : def)

const useIsPlaying = (audio: HTMLAudioElement) => {
  const isPlayingNative = ref(false)
  const wasUnsupportedType = ref(false)

  audio.addEventListener('play', () => {
    isPlayingNative.value = true
  })
  audio.addEventListener('pause', () => {
    isPlayingNative.value = false
  })
  audio.addEventListener('ended', () => {
    isPlayingNative.value = false
  })
  audio.addEventListener('emptied', () => {
    isPlayingNative.value = false
  })

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

  const isPlaying = computed({
    get() {
      return isPlayingNative.value
    },
    set(v) {
      if (v) {
        start()
      } else {
        pause()
      }
    }
  })

  return { wasUnsupportedType, isPlaying }
}

export const useCurrentTime = (
  audio: Ref<HTMLAudioElement | undefined> | HTMLAudioElement
) => {
  const nativeCurrentTime = ref(toFinite(unref(audio)?.currentTime ?? 0, 0))

  const setupTimeUpdate = (audio: HTMLAudioElement) => {
    audio.addEventListener('timeupdate', () => {
      nativeCurrentTime.value = toFinite(audio.currentTime, 0)
    })
  }

  if (isRef(audio)) {
    onMounted(() => {
      if (!audio.value) return
      setupTimeUpdate(audio.value)
    })
  } else {
    setupTimeUpdate(audio)
  }

  const currentTime = computed<number>({
    get() {
      return nativeCurrentTime.value
    },
    set(v) {
      const a = unref(audio)
      if (a) {
        a.currentTime = v
      }
    }
  })

  return currentTime
}

export const useDuration = (
  audio: Ref<HTMLAudioElement | undefined> | HTMLAudioElement
) => {
  const nativeDuration = ref(toFinite(unref(audio)?.duration ?? 0, 0))

  const setupLoadedMetadata = (audio: HTMLAudioElement) => {
    audio.addEventListener('loadedmetadata', () => {
      nativeDuration.value = toFinite(audio.duration, 0)
    })
  }

  if (isRef(audio)) {
    onMounted(() => {
      if (!audio.value) return
      setupLoadedMetadata(audio.value)
    })
  } else {
    setupLoadedMetadata(audio)
  }

  const duration = readonly(nativeDuration)
  return duration
}

const useVolume = (audio: HTMLAudioElement) => {
  const nativeVolume = ref(toFinite(audio.volume, 1))
  audio.addEventListener('volumechange', () => {
    nativeVolume.value = toFinite(audio.volume, 1)
  })
  const volume = computed<number>({
    get() {
      return nativeVolume.value
    },
    set(v) {
      audio.volume = v / 100
    }
  })
  return volume
}

const useAudio = (
  fileMeta: Ref<FileInfo | undefined>,
  fileRawPath: Ref<string>
) => {
  const { isPinPShown, showPictureInPictureWindow } = usePictureInPicture()

  const audio = new Audio()

  const cantPlay = computed(
    () => fileMeta.value && audio.canPlayType(fileMeta.value.mime) === ''
  )

  watch(
    () => fileMeta.value?.mime + fileRawPath.value,
    () => {
      if (audio.canPlayType(fileMeta.value?.mime ?? '')) {
        audio.src = fileRawPath.value
      }
    },
    { immediate: true }
  )

  const { wasUnsupportedType, isPlaying } = useIsPlaying(audio)
  const currentTime = useCurrentTime(audio)
  const duration = useDuration(audio)
  const volume = useVolume(audio)

  const startPinP = (iconId: string) => {
    showPictureInPictureWindow(audio, iconId)
  }
  return {
    cantPlay,
    wasUnsupportedType,
    isPlaying,
    currentTime,
    duration,
    volume,
    isPinPShown,
    startPinP
  }
}

export default useAudio
