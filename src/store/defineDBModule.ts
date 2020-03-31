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

export const defineDBModule = <O extends WithOptionalState, S = StateOf<O>>(
  options: O & ModuleOptions<S> & DBPath
): O => {
  dbModulePaths.push(options.path)
  return defineModule(options)
}

export const persistReducer: PersistOptions<any>['reducer'] = state => {
  const persistState = {}
  dbModulePaths.forEach(path => {
    shvlSet(persistState, path, shvlGet(state, path))
  })
  return persistState
}
