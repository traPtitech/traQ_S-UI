import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { rtc } from '.'
import { moduleGetterContext } from '/@/store'
import { getTalkingLoundnessLevel } from '/@/lib/audioStreamMixer'
import { UserId } from '/@/types/entity-ids'

const rtcGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, rtc)

export const getters = defineGetters<S>()({
  isCurrentDevice: state => state.mixer !== undefined,
  getTalkingLoudnessLevel: state => (userId: UserId) => {
    const level = state.mixer?.getLevelOf(userId)
    return getTalkingLoundnessLevel(level)
  }
})
