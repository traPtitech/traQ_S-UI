import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { compareString } from '@/lib/util/string'
import { entities } from './index'
import { moduleGetterContext } from '@/store'
import { User, Stamp } from '@traptitech/traq'

const entitiesGetterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, entities)

export const getters = defineGetters<S>()({
  gradeTypeUserGroups(state) {
    return Object.values(state.userGroups).filter(
      group => group.type === 'grade'
    )
  },
  getStampByName(...args): (name: string) => Stamp | undefined {
    const { state } = entitiesGetterContext(args)
    return (name: string) => {
      return Object.values(state.stamps).find(stamp => stamp.name === name)
    }
  },
  getUserByName(...args): (name: string) => User | undefined {
    const { state } = entitiesGetterContext(args)
    return (name: string) => {
      return Object.values(state.users).find(user => user.name === name)
    }
  }
})
