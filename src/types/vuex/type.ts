/* tslint:disable:interface-over-type-literal */

import 'vuex'

declare module 'vuex' {
  // ______________________________________________________
  //
  type Getters<S, G> = {
    [K in keyof G]: (
      state: S,
      getters: G,
      rootState: RootState,
      rootGetters: RootGetters
    ) => G[K]
  }
  // ______________________________________________________
  //
  type Mutations<S, M> = { [K in keyof M]: (state: S, payload: M[K]) => void }
  // ______________________________________________________
  //
  type ExCommit<M> = <T extends keyof M>(type: T, payload?: M[T]) => void
  type ExDispatch<A> = <T extends keyof A>(type: T, payload?: A[T]) => any
  interface ExActionContext<S, A, G, M> {
    commit: ExCommit<M>
    dispatch: ExDispatch<A>
    state: S
    getters: G
    rootState: RootState
    rootGetters: RootGetters
  }
  type Actions<S, A, G = {}, M = {}> = {
    [K in keyof A]: (ctx: ExActionContext<S, A, G, M>, payload: A[K]) => any
  }
  // ______________________________________________________
  //
  interface ExStore extends Store<RootState> {
    getters: RootGetters
    commit: ExCommit<RootMutations>
    dispatch: ExDispatch<RootActions>
  }
  type StoreContext = ExActionContext<
    RootState,
    RootActions,
    RootGetters,
    RootMutations
  >
}
