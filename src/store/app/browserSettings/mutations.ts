import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { SendKeys } from '.'

export const mutations = defineMutations<S>()({
  setSendKey(state, key: SendKeys) {
    state.sendKey = key
  }
})
