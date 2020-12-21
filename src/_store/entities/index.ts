import { defineModule } from 'direct-vuex'
import { actions } from './actions'

/**
 * サーバーから取得したエンティティを扱うstore
 *
 * このモジュールのstateは id => body の形をしたRecordのみ許す
 */
export const entities = defineModule({
  namespaced: true,
  actions
})
