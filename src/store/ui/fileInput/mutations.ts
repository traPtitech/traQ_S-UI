import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  addFile(state, file: File) {
    state.fileList.push(file)
  },
  removeFileAt(state, index: number) {
    if (0 <= index && index < state.fileList.length) {
      state.fileList.splice(index, 1)
    }
  },
  clearFiles(state) {
    state.fileList = []
  }
})
