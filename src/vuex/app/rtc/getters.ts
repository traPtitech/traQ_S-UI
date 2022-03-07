import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { rtc } from '.'
import { moduleGetterContext } from '/@/vuex'
import { UserId } from '/@/types/entity-ids'

const rtcGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, rtc)

export const getters = defineGetters<S>()({
  isCurrentDevice: state => state.mixer !== undefined,
  getUserVolume: state => (userId: UserId) => {
    return state.mixer?.getStreamVolume(userId) ?? 0
  }
})
