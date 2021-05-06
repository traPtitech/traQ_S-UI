import { Ref, ref, computed, watch, readonly, shallowRef } from 'vue'
import usePictureInPicture from './pictureInPicture'
import { FileInfo } from '@traptitech/traq'

const toFinite = (n: number, def: number) => (Number.isFinite(n) ? n : def)

const useIsPlaying = (audio: Ref<HTMLAudioElement | undefined>) => {
  const isPlayingNative = ref(false)
  const wasUnsupportedType = ref(false)

  const onPlay = () => {
    isPlayingNative.value = true
  }
  const onStop = () => {
    isPlayingNative.value = false
  }

  watch(
    audio,
    (newAudio, oldAudio) => {
      if (oldAudio) {
        oldAudio.removeEventListener('play', onPlay)
        oldAudio.removeEventListener('pause', onStop)
        oldAudio.removeEventListener('ended', onStop)
        oldAudio.removeEventListener('emptied', onStop)
      }
      if (newAudio) {
        newAudio.addEventListener('play', onPlay)
        newAudio.addEventListener('pause', onStop)
        newAudio.addEventListener('ended', onStop)
        newAudio.addEventListener('emptied', onStop)
      }
    },
    { immediate: true }
  )

  const start = async () => {
    if (!audio.value) return
    try {
      await audio.value.play()
    } catch (e: unknown) {
      const err = e as Error
      if (err.name === 'NotSupportedError') {
        wasUnsupportedType.value = true
      }
    }
  }
  const pause = () => {
    audio.value?.pause()
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

export const useCurrentTime = (audio: Ref<HTMLAudioElement | undefined>) => {
  const nativeCurrentTime = ref(toFinite(audio.value?.currentTime ?? 0, 0))

  const onTimeupdated = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    nativeCurrentTime.value = toFinite(audio.value!.currentTime, 0)
  }

  watch(
    audio,
    (newAudio, oldAudio) => {
      if (oldAudio) {
        oldAudio.removeEventListener('timeupdate', onTimeupdated)
      }
      if (newAudio) {
        newAudio.addEventListener('timeupdate', onTimeupdated)
      }
    },
    { immediate: true }
  )

  const currentTime = computed<number>({
    get() {
      return nativeCurrentTime.value
    },
    set(v) {
      if (!audio.value) return
      audio.value.currentTime = v
    }
  })

  return currentTime
}

export const useDuration = (audio: Ref<HTMLAudioElement | undefined>) => {
  const nativeDuration = ref(toFinite(audio.value?.duration ?? 0, 0))

  const onLoadedMetadata = () => {
    if (!audio.value) return
    nativeDuration.value = toFinite(audio.value.duration, 0)
  }

  watch(
    audio,
    (newAudio, oldAudio) => {
      if (oldAudio) {
        oldAudio.removeEventListener('loadedmetadata', onLoadedMetadata)
      }
      if (newAudio) {
        newAudio.addEventListener('loadedmetadata', onLoadedMetadata)
      }
    },
    { immediate: true }
  )

  const duration = readonly(nativeDuration)
  return duration
}

const useVolume = (audio: Ref<HTMLAudioElement | undefined>) => {
  const nativeVolume = ref(toFinite(audio.value?.volume ?? 1, 1))

  const onVolumeChange = () => {
    if (!audio.value) return
    nativeVolume.value = toFinite(audio.value.volume, 1)
  }

  watch(
    audio,
    (newAudio, oldAudio) => {
      if (oldAudio) {
        oldAudio.removeEventListener('volumechange', onVolumeChange)
      }
      if (newAudio) {
        newAudio.addEventListener('volumechange', onVolumeChange)
      }
    },
    { immediate: true }
  )

  const volume = computed<number>({
    get() {
      return nativeVolume.value
    },
    set(v) {
      if (!audio.value) return
      audio.value.volume = v / 100
    }
  })
  return volume
}

const useAudio = (
  fileMeta: Ref<FileInfo | undefined>,
  fileRawPath: Ref<string>
) => {
  const { isPinPShown, showPictureInPictureWindow } = usePictureInPicture()

  const audio = shallowRef(new Audio())

  const cantPlay = computed(
    () => fileMeta.value && audio.value.canPlayType(fileMeta.value.mime) === ''
  )

  watch(
    () => fileMeta.value?.mime + fileRawPath.value,
    () => {
      if (audio.value.canPlayType(fileMeta.value?.mime ?? '')) {
        audio.value.src = fileRawPath.value
      }
    },
    { immediate: true }
  )

  const { wasUnsupportedType, isPlaying } = useIsPlaying(audio)
  const currentTime = useCurrentTime(audio)
  const duration = useDuration(audio)
  const volume = useVolume(audio)

  const startPinP = (iconId: string) => {
    showPictureInPictureWindow(audio.value, iconId)
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
