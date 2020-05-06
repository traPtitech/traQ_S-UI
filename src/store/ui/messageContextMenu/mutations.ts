import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { MessageId } from '@/types/entity-ids'

export const mutations = defineMutations<S>()({
  setTarget(state, messageId: MessageId) {
    state.target = messageId
  },
  initTarget(state) {
    state.target = undefined
  },
  setPosition(state, position: { x: number; y: number }) {
    state.position = position
  },
  initPosition(state) {
    state.position = { x: 0, y: 0 }
  },
  setIsMinimum(state, isMinimum: boolean) {
    state.isMinimum = isMinimum
  },
  initIsMinimum(state) {
    state.isMinimum = false
  }
})
