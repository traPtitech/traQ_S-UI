import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtc } from './index'
import apis from '@/lib/apis'
import { ChannelId } from '@/types/entity-ids'
import { randomString } from '@/lib/util/randomString'

export const rtcActionContext = (context: any) =>
  moduleActionContext(context, rtc)

export const actions = defineActions({
  async fetchRTCState(context) {
    const { commit } = rtcActionContext(context)
    const { data } = await apis.getWebRTCState()
    if (data) {
      commit.setRTCState(data.flat(1))
    }
  },
  async startOrJoinRTCSession(
    context,
    payload: { channelId: ChannelId; sessionType: string }
  ) {
    const { state, commit, getters } = rtcActionContext(context)
    if (
      state.currentRTCChannel &&
      state.currentRTCChannel !== payload.channelId
    ) {
      throw `RTC session is already open for channel ${payload.channelId}`
    }
    if (!state.currentRTCChannel) {
      commit.setCurrentRTCChannel(payload.channelId)
    }
    const currentSession = getters.channelSessionsMap[payload.channelId]?.find(
      session => session.state === payload.sessionType
    )
    const sessionId = currentSession?.sessionId ?? randomString()
    commit.addCurrentRTCSession({
      state: payload.sessionType,
      sessionId
    })
  },
  async startQall(context, channelId: ChannelId) {
    const { dispatch } = rtcActionContext(context)
    dispatch.startOrJoinRTCSession({ channelId, sessionType: 'qall' })
  },
  async endQall(context) {
    const { commit } = rtcActionContext(context)
    commit.removeCurrentRTCSessionsBySessionType('qall')
  }
})
