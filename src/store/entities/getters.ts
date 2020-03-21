import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { compareString } from '@/lib/util/string'

export const getters = defineGetters<S>()({
  gradeTypeUserGroups(state) {
    return Object.values(state.userGroups).filter(
      group => group.type === 'grade'
    )
  }
})
