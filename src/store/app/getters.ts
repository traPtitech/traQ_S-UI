import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { app } from './index'
import { moduleGetterContext } from '@/store'

const appGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, app)

export const getters = defineGetters<S>()({
  getSearchHistories(state) {
    return state.searchHistories
  }
})
