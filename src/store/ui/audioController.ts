import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { destroyAudio } from '/@/lib/dom/audio'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { FileId } from '/@/types/entity-ids'

const useAudioControllerPinia = defineStore('ui/audioController', () => {
  const audio = ref<HTMLAudioElement>(new Audio())
  const fileId = ref<FileId>()
  const shouldDestroy = ref(false)

  const _setAudio = (
    newAudio: HTMLAudioElement,
    newFileId: FileId | undefined
  ) => {
    // 同じものの場合はセットしなおさない
    // セットしなおすとpause()によって曲が再生されなくなる
    if (newAudio === audio.value) return

    if (shouldDestroy.value) {
      destroyAudio(audio.value)
    } else {
      audio.value.pause()
    }
    audio.value = newAudio
    fileId.value = newFileId
    shouldDestroy.value = false
  }
  const setAudio = (audio: HTMLAudioElement, fileId: FileId) =>
    _setAudio(audio, fileId)
  const resetAudio = () => {
    _setAudio(new Audio(), undefined)
  }

  return {
    audio,
    fileId,
    shouldDestroy,
    setAudio,
    resetAudio
  }
})

export const useAudioController = convertToRefsStore(useAudioControllerPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useAudioControllerPinia, import.meta.hot)
  )
}
