import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { mobileMaxBreakpoint } from '@/lib/media'

export const getters = defineGetters<S>()({
  isMobile(state) {
    return state.viewportWidth <= mobileMaxBreakpoint
  }
})
