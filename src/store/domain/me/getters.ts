import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { StampId } from '@/types/entity-ids'

export const getters = defineGetters<S>()({
  recentStampIds(state): StampId[] {
    const history = Object.entries(state.stampHistory)
      .sort((e1, e2) => {
        // 日付の降順
        if (e1[1] > e2[1]) return -1
        if (e1[1] < e2[1]) return 1
        return 0
      })
      .map(e => e[0])
    return history
  }
})
