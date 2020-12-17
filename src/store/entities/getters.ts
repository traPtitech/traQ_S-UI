import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { entities } from './index'
import { moduleGetterContext } from '@/store'
import { User } from '@traptitech/traq'
import { ActiveUser, isActive } from '@/lib/user'
import { UserId } from '@/types/entity-ids'

const entitiesGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, entities)

export const getters = defineGetters<S>()({
  userByName(state): (name: string) => User | undefined {
    return name => {
      const loweredName = name.toLowerCase()
      return [...state.usersMap.values()].find(
        user => user?.name.toLowerCase() === loweredName
      )
    }
  },
  activeUsersMap(state): Map<string, ActiveUser> {
    return new Map(
      [...state.usersMap.entries()].filter((entry): entry is [
        UserId,
        ActiveUser
      ] => isActive(entry[1]))
    )
  }
})
