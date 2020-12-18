import { wsListener } from '@/lib/websocket'
import store, { AppStore as AppStoreWithOriginal } from '@/store'

type AppStore = Omit<AppStoreWithOriginal, 'original'>
type ModuleNamesOf<K extends keyof AppStore> = keyof AppStore[K]
type SubModuleNamesOf<
  K extends keyof AppStore,
  ModuleName extends ModuleNamesOf<K>
> = keyof AppStore[K][ModuleName]

type ModuleNames = ModuleNamesOf<'state'>
type SubModuleNames<ModuleName extends ModuleNames> = SubModuleNamesOf<
  'state',
  ModuleName
> &
  SubModuleNamesOf<'getters', ModuleName> &
  SubModuleNamesOf<'commit', ModuleName> &
  SubModuleNamesOf<'dispatch', ModuleName>

type Module<ModuleName extends ModuleNames> = {
  state: AppStore['state'][ModuleName]
  getters: AppStore['getters'][ModuleName]
  commit: AppStore['commit'][ModuleName]
  dispatch: AppStore['dispatch'][ModuleName]
}

type SubModule<
  ModuleName extends ModuleNames,
  SubModuleName extends SubModuleNames<ModuleName>
> = {
  state: AppStore['state'][ModuleName][SubModuleName]
  getters: AppStore['getters'][ModuleName][SubModuleName]
  commit: AppStore['commit'][ModuleName][SubModuleName]
  dispatch: AppStore['dispatch'][ModuleName][SubModuleName]
}

type ListenerSetter<ModuleName extends ModuleNames> = (
  listener: typeof wsListener,
  module: Module<ModuleName>
) => void
type ListenerSetterSub<
  ModuleName extends ModuleNames,
  SubModuleName extends SubModuleNames<ModuleName>
> = (
  listener: typeof wsListener,
  subModule: SubModule<ModuleName, SubModuleName>
) => void

const getModuleFromStore = (store: AppStore, moduleName: ModuleNames) => ({
  state: store.state[moduleName],
  getters: store.getters[moduleName],
  commit: store.commit[moduleName],
  dispatch: store.dispatch[moduleName]
})
const getSubModuleFromStore = <ModuleName extends ModuleNames>(
  store: AppStore,
  moduleName: ModuleName,
  subModuleName: SubModuleNames<ModuleName>
) => ({
  state: store.state[moduleName][subModuleName],
  getters: store.getters[moduleName][subModuleName],
  commit: store.commit[moduleName][subModuleName],
  dispatch: store.dispatch[moduleName][subModuleName]
})

/**
 * WebSocketからイベントを受け取る用
 * @param moduleName 一階層目のモジュール名のみ利用可能
 * @param listenerSetter この中でlistenする
 */
export const defineListeners = <ModuleName extends ModuleNames>(
  moduleName: ModuleName,
  listenerSetter: ListenerSetter<ModuleName>
): void => {
  listenerSetter(wsListener, getModuleFromStore(store, moduleName))
}

/**
 * WebSocketからイベントを受け取る用
 * @param moduleName 一階層目のモジュール名のみ利用可能
 * @param subModuleName 二階層目のモジュール名のみ利用可能
 * @param listenerSetter この中でlistenする
 */
export const defineSubModuleListeners = <
  ModuleName extends ModuleNames,
  SubModuleName extends SubModuleNames<ModuleName>
>(
  moduleName: ModuleName,
  subModuleName: SubModuleName,
  listenerSetter: ListenerSetterSub<ModuleName, SubModuleName>
): void => {
  listenerSetter(
    wsListener,
    getSubModuleFromStore(store, moduleName, subModuleName) as SubModule<
      ModuleName,
      SubModuleName
    >
  )
}
