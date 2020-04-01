import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { UserId } from '@/types/entity-ids'
import { moduleGetterContext } from '..'
import { domain } from './index'

const domainGetterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, domain)

export const getters = defineGetters<S>()({
  isUserOnline(...args): (id: UserId) => boolean {
    const { state } = domainGetterContext(args)
    return (id: UserId) => {
      return state.onlineUsers.includes(id)
    }
  }
})
