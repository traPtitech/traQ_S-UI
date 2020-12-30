import { defineModule } from 'direct-vuex'
import { rtc } from './rtc'
import { browserSettings } from './browserSettings'
import { rtcSettings } from './rtcSettings'
import { themeSettings } from './themeSettings'

export const app = defineModule({
  namespaced: true,
  modules: {
    rtc,
    browserSettings,
    rtcSettings,
    themeSettings
  }
})
