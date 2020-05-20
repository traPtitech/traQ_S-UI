import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export const DEFAULT_TOAST_TIMEOUT = 1500
export const MAX_TOAST_COUNT = 5

export interface Toast {
  /**
   * 表示タイプ
   */
  type: 'success' | 'error' | 'info'
  /**
   * 表示する文字
   */
  text: string
  /**
   * 表示する時間 (ms)
   */
  timeout: number
  /**
   * クリック時の挙動
   *
   * デフォルトはトーストの削除
   */
  onClick?: () => unknown
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
