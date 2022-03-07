import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { modal } from './modal'

/**
 * 通信することもIndexedDBを利用することもないストア
 * 特定のコンポーネントのみが利用することが多い
 * ここが他のストアを変更することはあっても、ここをほかのストアが変更することはない
 */
export const ui = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    modal
  }
})
