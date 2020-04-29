import {
  defineModule,
  WithOptionalState,
  StateOf,
  ModuleOptions
} from 'direct-vuex'
import { PersistOptions } from 'vuex-persist'
import { get as shvlGet, set as shvlSet } from 'shvl'
import { AppStore } from '.'

interface DBPath {
  /**
   * `.`区切りのそのモジュールへのパス (ex. `app.browserSettings`)
   * あるいは`.`区切りのその値へのパスの配列 (ex. `domain.me.details`)
   */
  path: string | string[]
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
  if (Array.isArray(options.path)) {
    dbModulePaths.push(...options.path)
  } else {
    dbModulePaths.push(options.path)
  }
  return defineModule(options)
}

/**
 * 同期するストアのモジュール/値の絞り込み
 */
export const persistReducer: PersistOptions<unknown>['reducer'] = state => {
  const typedState = state as AppStore['state']
  const persistState = {}
  dbModulePaths.forEach(path => {
    shvlSet(persistState, path, shvlGet(typedState, path))
  })
  return persistState
}
