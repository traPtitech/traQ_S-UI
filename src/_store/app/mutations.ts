import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { Version } from '@traptitech/traq'

export const mutations = defineMutations<S>()({
  setLoginCheckSucceeded(state: S) {
    state.loginCheckSucceeded = true
  },
  setInitialFetchCompleted(state: S) {
    state.initialFetchCompleted = true
  },
  setVersion(state: S, version: Readonly<Version>) {
    state.version = version
  }
  // TODO: テーマの変更
})
