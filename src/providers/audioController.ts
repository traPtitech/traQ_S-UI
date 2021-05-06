import { FileId } from '@/types/entity-ids'
import { provide, inject, InjectionKey, reactive, computed } from 'vue'

const audioControllerSymbol: InjectionKey<AudioController> = Symbol()

type AudioController = {
  audio: HTMLAudioElement
  fileId: FileId | undefined
}

const createAudioController = (): AudioController => {
  return reactive({
    audio: new Audio(),
    fileId: undefined
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

  const setAudio = (audio: HTMLAudioElement, fileId: FileId) => {
    if (states.fileId === fileId) return
    states.audio.pause()
    states.audio = audio
    states.fileId = fileId
  }
  const resetAudio = () => {
    states.audio.pause()
    states.audio = new Audio()
    states.fileId = undefined
  }

  const audio = computed(() => states.audio)
  const fileId = computed(() => states.fileId)

  return { audio, fileId, setAudio, resetAudio }
}

export default useAudioController
