import { createGetters } from 'direct-vuex'
import { S } from './state'
import { mobileMaxBreakpoint } from '@/lib/media'

export const getters = createGetters<S>()({
  isMobile(state) {
    return state.viewportWidth <= mobileMaxBreakpoint
  }
})
