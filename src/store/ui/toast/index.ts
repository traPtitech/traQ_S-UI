import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export const DEFAULT_TOAST_TIMEOUT = 1000

export interface Toast {
  /**
   * 表示タイプ
   */
  type: 'info' | 'error'
  /**
   * 表示する文字
   */
  text: string
  /**
   * 表示する時間 (ms)
   */
  timeout: number
  /**
   * 自動付与されるid
   */
  id: number
}

export const toast = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
