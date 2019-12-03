import { Mutations } from 'vuex'
import { S, M } from './type'

export const mutations: Mutations<S, M> = {
  increment(state) {
    state.count++
  }
}
