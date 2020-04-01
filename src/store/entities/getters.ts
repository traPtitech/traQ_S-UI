import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { compareString } from '@/lib/util/string'
import { entities } from './index'
import { moduleGetterContext } from '@/store'
import { User, Stamp, UserGroup } from '@traptitech/traq'
import { UserId } from '@/types/entity-ids'

const entitiesGetterContext = (args: [any, any, any, any]) =>
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
      return Object.values(state.users).find(user => user.name === name)
    }
  },
  nonEmptyStampPaletteIds(state) {
    return Object.values(state.stampPalettes)
      .filter(palette => palette.stamps?.length > 0)
      .map(palette => palette.id)
  }
})
