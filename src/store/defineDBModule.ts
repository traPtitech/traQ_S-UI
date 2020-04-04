import {
  defineModule,
  WithOptionalState,
  StateOf,
  ModuleOptions
} from 'direct-vuex'
import { PersistOptions } from 'vuex-persist'
import { get as shvlGet, set as shvlSet } from 'shvl'

interface DBPath {
  /**
   * `.`区切りのそのモジュールへのパス (ex. `app.browserSettings`)
   */
  path: string
}

const dbModulePaths: string[] = []

/**
 * 手元のIndexedDBに保存する情報は`defineModule`の代わりに`defineDBModule`を利用するだけで同期される
 * 中でObjectやArrayを使用していた場合、デフォルトのものと現在のものが`_.merge`されるので注意が必要
 * 参考: https://github.com/traPtitech/traQ_S-UI/pull/205#issuecomment-608380936
 */
export const defineDBModule = <O extends WithOptionalState, S = StateOf<O>>(
  options: O & ModuleOptions<S> & DBPath
): O => {
  dbModulePaths.push(options.path)
  return defineModule(options)
}

/**
 * 同期するストアのモジュールの絞り込み
 */
export const persistReducer: PersistOptions<any>['reducer'] = state => {
  const persistState = {}
  dbModulePaths.forEach(path => {
    shvlSet(persistState, path, shvlGet(state, path))
  })
  return persistState
}
