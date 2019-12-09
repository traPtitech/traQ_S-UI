import { createGetters } from 'direct-vuex'
import { S } from './state'

export const getters = createGetters<S>()({
  count(state) {
    return state.count
  }
})
