import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S, ModalState } from './state'
import { UserDetail } from '@traptitech/traq'
import { UserId } from '@/types/entity-ids'

export const mutations = defineMutations<S>()({
  setState: (state, modalStates: ModalState[]) => {
    state.modalState = modalStates
  },
  pushState: (state, modalState: ModalState) => {
    state.modalState = [...state.modalState, modalState]
  },
  popState: state => state.modalState.splice(1),
  setUserDetail: (state, userDetail: UserDetail) => {
    Vue.set(state.userDetails, userDetail.id, userDetail)
  },
  deleteUserDetail: (state, userId: UserId) => {
    Vue.delete(state.userDetails, userId)
  }
})
