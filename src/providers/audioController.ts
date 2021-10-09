import { destroyAudio } from '/@/lib/dom/audio'
import { FileId } from '/@/types/entity-ids'
import { provide, inject, InjectionKey, reactive, computed } from 'vue'

const audioControllerSymbol: InjectionKey<AudioController> = Symbol()

type AudioController = {
  audio: HTMLAudioElement
  fileId: FileId | undefined
  shouldDestroy: boolean
}

const createAudioController = (): AudioController => {
  return reactive({
    audio: new Audio(),
    fileId: undefined,
    shouldDestroy: false
  })
}

export const provideAudioController = () => {
  provide(audioControllerSymbol, createAudioController())
}

export const useAudioController = () => {
  const states = inject(audioControllerSymbol)
  if (!states) {
    throw new Error('useAudioController() was called without provider.')
  }

  const _setAudio = (audio: HTMLAudioElement, fileId: FileId | undefined) => {
    // 同じものの場合はセットしなおさない
    // セットしなおすとpause()によって曲が再生されなくなる
    if (audio === states.audio) return

    if (states.shouldDestroy) {
      destroyAudio(states.audio)
    } else {
      states.audio.pause()
    }
    states.audio = audio
    states.fileId = fileId
    states.shouldDestroy = false
  }
  const setAudio = (audio: HTMLAudioElement, fileId: FileId) =>
    _setAudio(audio, fileId)
  const resetAudio = () => {
    _setAudio(new Audio(), undefined)
  }

  const setShouldDestroy = () => {
    states.shouldDestroy = true
  }

  const audio = computed(() => states.audio)
  const fileId = computed(() => states.fileId)

  return { audio, fileId, setAudio, resetAudio, setShouldDestroy }
}

export default useAudioController
