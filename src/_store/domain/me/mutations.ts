import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { MyUserDetail } from '@traptitech/traq'

export const mutations = defineMutations<S>()({
  setDetail(state: S, detail: Readonly<MyUserDetail>) {
    state.detail = detail
  }
})
