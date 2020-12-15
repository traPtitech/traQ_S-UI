import { defineGetters } from 'direct-vuex'
import { S } from './state'
import {
  entities,
  StampMap,
  UserMap,
  ActiveUserMap,
  Undefinedable
} from './index'
import { moduleGetterContext } from '@/_store'
import { User, Stamp, UserGroup } from '@traptitech/traq'
import { UserId, DMChannelId } from '@/types/entity-ids'
import { isActive, ActiveUser } from '@/lib/user'

const entitiesGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, entities)

export const getters = defineGetters<S>()({
  gradeTypeUserGroups(state) {
    return Object.values(state.userGroups).filter(
      group => group.type === 'grade'
    )
  },
  gradeGroupByUserId(...args): (userId: UserId) => UserGroup | undefined {
    const { getters } = entitiesGetterContext(args)
    return userId =>
      getters.gradeTypeUserGroups.find((userGroup: UserGroup) =>
        userGroup.members?.some(member => member.id === userId)
      )
  },
  stampNameTable(state) {
    return Object.fromEntries(
      Object.values(state.stamps as StampMap).map(stamp => [stamp.name, stamp])
    )
  },
  stampByName(...args): (name: string) => Stamp | undefined {
    const { getters } = entitiesGetterContext(args)
    return name => getters.stampNameTable[name]
  },
  userByName(state): (name: string) => User | undefined {
    return name => {
      const loweredName = name.toLowerCase()
      return Object.values(state.users).find(
        user => user?.name.toLowerCase() === loweredName
      )
    }
  },
  userNameByDMChannelId(state): (id: DMChannelId) => string | undefined {
    return id => state.users[state.dmChannels[id].userId]?.name
  },
  activeUsers(state): Undefinedable<ActiveUserMap> {
    return Object.fromEntries(
      Object.entries(state.users as UserMap).filter((entry): entry is [
        UserId,
        ActiveUser
      ] => isActive(entry[1]))
    )
  },
  DMChannelUserIdTable(state) {
    return Object.fromEntries(
      Object.values(state.dmChannels).map(c => [c.userId, c.id])
    )
  },
  DMChannelIdByUserId(...args): (id: UserId) => DMChannelId | undefined {
    const { getters } = entitiesGetterContext(args)
    return id => getters.DMChannelUserIdTable[id]
  },
  userGroupByName(state): (name: string) => UserGroup | undefined {
    return name => {
      const loweredName = name.toLowerCase()
      return Object.values(state.userGroups).find(
        userGroup => userGroup?.name.toLowerCase() === loweredName
      )
    }
  },
  nonEmptyStampPaletteIds(state) {
    return Object.values(state.stampPalettes)
      .filter(palette => palette.stamps?.length > 0)
      .map(palette => palette.id)
  }
})
