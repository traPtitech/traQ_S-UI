import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { entities } from '.'
import { moduleGetterContext } from '@/_store'

const entitiesGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, entities)

export const getters = defineGetters<S>()({})
