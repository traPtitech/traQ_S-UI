import { TypedMitt } from '@/lib/typedMitt'
import { waitMount } from '@/onMount'
import store, { AppStore } from '@/store'
import { StoreOrModuleOptions } from 'direct-vuex'
import { DirectActions } from 'direct-vuex/types/direct-types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMitt = Omit<TypedMitt<any>, 'emit'>

type DispatchOfModule<O extends StoreOrModuleOptions> = {
  dispatch: DirectActions<O>
}

type ListenerSetter<
  Listener extends AnyMitt,
  O extends StoreOrModuleOptions
> = (listener: Listener, module: DispatchOfModule<O>) => void

// storeからそのモジュールを取り出す関数
type Reducer<O extends StoreOrModuleOptions> = (
  store: AppStore['dispatch']
) => DirectActions<O>

/**
 * イベントを受け取る用
 * @typeParam O そのモジュールのオプションの型
 * @param listenerSetter この中でlistenする
 */
export const createDefineListeners =
  <O extends StoreOrModuleOptions>() =>
  <Listener extends AnyMitt>(
    listener: Listener,
    listenerSetter: ListenerSetter<Listener, O>
  ): ((reducer: Reducer<O>) => Promise<void>) =>
  async reducer => {
    // Vueの初期化が終わらないとstoreにアクセスできない
    await waitMount
    listenerSetter(listener, { dispatch: reducer(store.dispatch) })
  }
