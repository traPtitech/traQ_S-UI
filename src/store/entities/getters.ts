import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { entities } from './index'
import { moduleGetterContext } from '@/store'
import { User, Stamp, UserGroup } from '@traptitech/traq'
import { UserId, DMChannelId } from '@/types/entity-ids'

const entitiesGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, entities)

export const getters = defineGetters<S>()({
  gradeTypeUserGroups(state) {
    return Object.values(state.userGroups).filter(
      group => group.type === 'grade'
    )
  },
  gradeNameByUserId(...args): (userId: UserId) => string | undefined {
    const { getters } = entitiesGetterContext(args)
    return (userId: UserId) => {
      return getters.gradeTypeUserGroups.find((userGroup: UserGroup) =>
        userGroup.members?.some(member => member.id === userId)
      )?.name
    }
  },
  stampByName(state): (name: string) => Stamp | undefined {
    return (name: string) => {
      return Object.values(state.stamps).find(stamp => stamp.name === name)
    }
  },
  userByName(state): (name: string) => User | undefined {
    return (name: string) => {
      const loweredName = name.toLowerCase()
      return Object.values(state.users).find(
        user => user?.name.toLowerCase() === loweredName
      )
    }
  },
  userNameByDMChannelId(state): (id: DMChannelId) => string | undefined {
    return (id: DMChannelId) => state.users[state.dmChannels[id].userId]?.name
  },
  DMChannelIdByUserId(state): (id: UserId) => DMChannelId | undefined {
    return id => Object.values(state.dmChannels).find(c => c.userId === id)?.id
  },
  userGroupByName(state): (name: string) => UserGroup | undefined {
    return (name: string) => {
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
