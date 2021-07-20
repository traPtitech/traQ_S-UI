import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { messages } from '.'
import { moduleGetterContext } from '/@/store'

const messagesGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, messages)

export const getters = defineGetters<S>()({})
