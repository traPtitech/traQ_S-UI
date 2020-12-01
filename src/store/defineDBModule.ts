import {
  defineModule,
  WithOptionalState,
  StateOf,
  ModuleOptions
} from 'direct-vuex'
import { PersistOptions } from 'vuex-persist'
import { get as shvlGet, set as shvlSet } from 'shvl'
import { AppStore } from '.'

// https://github.com/microsoft/TypeScript/issues/17002
declare global {
  interface ArrayConstructor {
    isArray(arg: unknown): arg is unknown[] | readonly unknown[]
  }
}

interface DBPath {
  /**
   * `.`区切りのそのモジュールへのパス (ex. `app.browserSettings`)
   * あるいは`.`区切りのその値へのパスの配列 (ex. `domain.me.details`)
   */
  path: string | ReadonlyArray<string>
}

const dbModulePaths: string[] = []

/**
 * 手元のIndexedDBに保存する情報は`defineModule`の代わりに`defineDBModule`を利用するだけで同期される
 * 中でObjectやArrayを使用していた場合、デフォルトのものと現在のものが`deepmerge`されるので注意が必要
 * vuex-persistの仕様で配列は置き換えになる
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
