import { defineGetters } from 'direct-vuex'
import { moduleGetterContext } from '@/_store'
import { S } from './state'
import { messageContextMenu } from './index'

const getterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, messageContextMenu)

export const getters = defineGetters<S>()({
  isShow(state) {
    return !!state.target
  }
})
