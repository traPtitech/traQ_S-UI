import type { FileInfo } from '@traptitech/traq'

import type { Ref } from 'vue'
import {
  computed,
  onUnmounted,
  readonly,
  ref,
  shallowRef,
  watch,
  watchEffect
} from 'vue'

import { useMediaSettingsStore } from '/@/store/app/mediaSettings'
import { useAudioController } from '/@/store/ui/audioController'

import usePictureInPicture from './usePictureInPicture'

const toFinite = (n: number | undefined, def: number) =>
  Number.isFinite(n) ? (n as number) : def

const useIsPlaying = (
  audio: Ref<HTMLAudioElement | undefined>,
  onPlayStart?: () => void
) => {
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
        isPlayingNative.value = !newAudio.paused
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
      onPlayStart?.()
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

  const isPlaying = computed<boolean>({
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
  const nativeCurrentTime = ref(toFinite(audio.value?.currentTime, 0))

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
        nativeCurrentTime.value = toFinite(newAudio.currentTime, 0)
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
  const nativeDuration = ref(toFinite(audio.value?.duration, 0))

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
        nativeDuration.value = toFinite(newAudio.duration, 0)
        newAudio.addEventListener('loadedmetadata', onLoadedMetadata)
      }
    },
    { immediate: true }
  )

  const duration = readonly(nativeDuration)
  return duration
}

const useVolume = (audio: Ref<HTMLAudioElement | undefined>) => {
  const { audioVolume } = useMediaSettingsStore()
  const isMute = ref(audio.value?.muted ?? false)

  // ストア音量とミュートをaudio要素へ常に反映する
  // 要素の差し替え・他プレイヤーによるストア変更・restore完了のいずれにも自動で追従する
  watchEffect(() => {
    if (!audio.value) return
    audio.value.volume = audioVolume.value ?? 1
    audio.value.muted = isMute.value
  })

  // ネイティブコントロール(<audio controls>)側の変更を取り込む
  const onVolumeChange = () => {
    if (!audio.value) return
    audioVolume.value = toFinite(audio.value.volume, audioVolume.value ?? 1)
    isMute.value = audio.value.muted
  }

  watch(
    audio,
    (newAudio, oldAudio) => {
      oldAudio?.removeEventListener('volumechange', onVolumeChange)
      newAudio?.addEventListener('volumechange', onVolumeChange)
    },
    { immediate: true }
  )

  const volume = computed<number>({
    get() {
      return audioVolume.value ?? 1
    },
    set(v) {
      audioVolume.value = v / 100
    }
  })
  return { volume, isMute }
}

const useLoop = (audio: Ref<HTMLAudioElement | undefined>) => {
  const nativeLoop = ref(false)

  const onLoopUpdate = () => {
    if (!audio.value) return
    nativeLoop.value = audio.value.loop
  }
  const observe = (a: HTMLAudioElement) => {
    const m = new MutationObserver(onLoopUpdate)
    m.observe(a, { attributeFilter: ['loop'] })
    return m
  }
  let mo: MutationObserver | undefined

  watch(
    audio,
    (newAudio, oldAudio) => {
      if (oldAudio) {
        mo?.disconnect()
      }
      if (newAudio) {
        nativeLoop.value = newAudio.loop
        mo = observe(newAudio)
      }
    },
    { immediate: true }
  )

  const loop = computed<boolean>({
    get() {
      return nativeLoop.value
    },
    set(v) {
      if (!audio.value) return
      audio.value.loop = v
    }
  })
  return loop
}

const useAudio = (
  fileMeta: Ref<FileInfo | undefined>,
  fileRawPath: Ref<string>,
  audioArg?: Ref<HTMLAudioElement>
) => {
  const { shouldDestroy, setAudio } = useAudioController()
  const { isPinPShown, showPictureInPictureWindow } = usePictureInPicture()

  const audio = audioArg ?? shallowRef(new Audio())

  onUnmounted(() => {
    shouldDestroy.value = true
  })

  const cantPlay = computed(
    () => fileMeta.value && audio.value.canPlayType(fileMeta.value.mime) === ''
  )

  watch(
    () => [fileMeta.value?.mime, fileRawPath.value],
    () => {
      if (audioArg) return
      if (!audio.value.canPlayType(fileMeta.value?.mime ?? '')) return
      audio.value.src = fileRawPath.value
    },
    { immediate: true }
  )

  const onPlay = !audioArg
    ? () => {
        if (!fileMeta.value) return
        setAudio(audio.value, fileMeta.value.id)
      }
    : undefined
  const { wasUnsupportedType, isPlaying } = useIsPlaying(audio, onPlay)
  const currentTime = useCurrentTime(audio)
  const duration = useDuration(audio)
  const volume = useVolume(audio)
  const loop = useLoop(audio)

  const startPinP = (iconId: string) => {
    showPictureInPictureWindow(audio.value, iconId)
    onPlay?.()
  }
  return {
    cantPlay,
    wasUnsupportedType,
    isPlaying,
    currentTime,
    duration,
    volume,
    loop,
    isPinPShown,
    startPinP
  }
}

export default useAudio
