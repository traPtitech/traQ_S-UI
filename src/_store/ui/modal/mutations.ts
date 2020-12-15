import { defineMutations } from 'direct-vuex'
import { S, ModalState } from './state'

export const mutations = defineMutations<S>()({
  setState: (state, modalStates: ModalState[]) => {
    state.modalState = modalStates
  },
  pushState: (state, modalState: ModalState) => {
    state.modalState = [...state.modalState, modalState]
  },
  popState: state => state.modalState.splice(1),
  setIsOnInitialModalRoute: (state, payload: boolean) => {
    state.isOnInitialModalRoute = payload
  },
  setIsClearingModal: (state, payload: boolean) => {
    state.isClearingModal = payload
  }
})
