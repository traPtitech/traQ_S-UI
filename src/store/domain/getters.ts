import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { domain } from './index'
import { moduleGetterContext } from '/@/store'
import { UserId } from '/@/types/entity-ids'

const domainGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, domain)

export const getters = defineGetters<S>()({
  isUserOnline(state): (id: UserId) => boolean {
    return id => state.onlineUsers.has(id)
  }
})
