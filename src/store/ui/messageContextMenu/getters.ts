import { defineGetters } from 'direct-vuex'
import { moduleGetterContext } from '@/store'
import { S } from './state'
import { messageContextMenu } from './index'

const getterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, messageContextMenu)

export const getters = defineGetters<S>()({
  getIsShowMenu(state) {
    return state.target ? true : false
  }
})
