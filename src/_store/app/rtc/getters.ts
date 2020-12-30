import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { UserId } from '@/types/entity-ids'
import { getTalkingLoundnessLevel } from '@/lib/audioStreamMixer'
import { rtc } from '.'
import { moduleGetterContext } from '@/_store'

const rtcGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, rtc)

export const getters = defineGetters<S>()({
  getTalkingLoudnessLevel: state => (userId: UserId) => {
    const level = state.mixer?.getLevelOf(userId)
    return getTalkingLoundnessLevel(level)
  }
})
