import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtc } from './index'
import apis from '@/lib/apis'

export const rtcActionContext = (context: any) =>
  moduleActionContext(context, rtc)

export const actions = defineActions({
  async fetchRTCState(context) {
    const { commit } = rtcActionContext(context)
    const { data } = await apis.getWebRTCState()
    if (data) {
      commit.setRTCState(data.flat(1))
    }
  }
})
