import { wsListener } from '@/lib/websocket'
import store, { AppStore } from '@/store'

type ModuleNames = keyof Omit<AppStore, 'original'>['state']

type Module<ModuleName extends ModuleNames> = {
  state: AppStore['state'][ModuleName]
  getters: AppStore['getters'][ModuleName]
  commit: AppStore['commit'][ModuleName]
  dispatch: AppStore['dispatch'][ModuleName]
}

type ListenerSetter<ModuleName extends ModuleNames> = (
  listener: typeof wsListener,
  module: Module<ModuleName>
) => void

const getModuleFromStore = (store: AppStore, moduleName: ModuleNames) => ({
  state: store.state[moduleName],
  getters: store.getters[moduleName],
  commit: store.commit[moduleName],
  dispatch: store.dispatch[moduleName]
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
