import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { Version } from '@traptitech/traq'

export const mutations = defineMutations<S>()({
  setLoaded(state: S, loaded: boolean) {
    state.loaded = loaded
  },
  setComponentLoaded(state: S, componentLoaded: boolean) {
    state.componentLoaded = componentLoaded
  },
  setInitialFetchCompleted(state: S) {
    state.initialFetchCompleted = true
  },
  setVersion(state: S, version: Readonly<Version>) {
    state.version = version
  }
  // TODO: テーマの変更
})
