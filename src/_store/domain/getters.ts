import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { moduleGetterContext } from '..'
import { domain } from './index'

const domainGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, domain)

export const getters = defineGetters<S>()({})
