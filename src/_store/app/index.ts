import { defineModule } from 'direct-vuex'
import { browserSettings } from './browserSettings'
import { rtcSettings } from './rtcSettings'
import { themeSettings } from './themeSettings'

export const app = defineModule({
  namespaced: true,
  modules: {
    browserSettings,
    rtcSettings,
    themeSettings
  }
})
