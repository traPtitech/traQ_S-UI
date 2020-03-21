import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { moduleGetterContext } from '@/store'
import { messagesView } from './index'

const getterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, messagesView)

export const getters = defineGetters<S>()({})
