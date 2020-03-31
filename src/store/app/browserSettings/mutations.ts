import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { SendKey } from '.'

export const mutations = defineMutations<S>()({
  setSendKey(state, key: SendKey[] | null) {
    state.sendKey = key
  }
})
