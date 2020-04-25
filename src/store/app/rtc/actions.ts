import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtc } from './index'
import apis from '@/lib/apis'
import { ChannelId } from '@/types/entity-ids'
import { randomString } from '@/lib/util/randomString'
import { client, initClient, destroyClient } from '@/lib/webrtc/traQRTCClient'
import AudioStreamMixer, { maxGain } from '@/lib/audioStreamMixer'
import { getUserAudio } from '@/lib/webrtc/userMedia'

export const rtcActionContext = (context: any) =>
  moduleActionContext(context, rtc)

export const actions = defineActions({
  // ---- RTC Session ---- //
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
  ): Promise<string> {
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
    return sessionId
  },

  // ---- RTC Connection ---- //

  initializeMixer(context) {
    const { state, commit } = rtcActionContext(context)
    const mixer = new AudioStreamMixer()

    Object.keys(state.remoteAudioStreamMap).forEach(userId => {
      const stream = state.remoteAudioStreamMap[userId]
      if (stream) {
        mixer.addStream(userId, stream)
      }
    })

    // mixer.addFileSource('qall_start', '/static/qall_start.mp3')
    // mixer.addFileSource('qall_end', '/static/qall_end.mp3')
    // mixer.addFileSource('qall_joined', '/static/qall_joined.mp3')
    // mixer.addFileSource('qall_left', '/static/qall_left.mp3')

    commit.setMixer(mixer)
  },

  async establishConnection(context) {
    const { rootState, dispatch } = rtcActionContext(context)
    if (!rootState.domain.me.detail) {
      throw 'application not initialized'
    }
    if (client) {
      client.closeConnection()
    }
    const id = rootState.domain.me.detail.id
    initClient(id)
    client?.addEventListener('connectionerror', e => {
      /* eslint-disable-next-line no-console */
      console.error(`[RTC] Failed to establish connection`)
      if (e.detail.err.type === 'unavailable-id') {
        /* eslint-disable-next-line no-console */
        console.error(`[RTC] Peer Id already in use!`)
      }
      window.alert('接続に失敗しました')
      dispatch.closeConnection()
    })
    await client?.establishConnection()
  },

  closeConnection(context) {
    const { state, commit } = rtcActionContext(context)
    if (!client) {
      return
    }
    if (state.mixer) {
      state.mixer.playFileSource('qall_end')
      state.mixer.muteAll()
    }
    client.closeConnection()
    destroyClient()
    commit.unsetMixer()
    commit.unsetLocalStream()
    commit.clearRemoteStream()
  },

  async joinVoiceChannel(context, room: string) {
    const { state, commit, rootState, dispatch } = rtcActionContext(context)
    if (!rootState.app.rtcSettings.isEnabled) {
      return
    }
    while (!client) {
      await dispatch.establishConnection()
    }

    dispatch.initializeMixer()
    if (!state.mixer) {
      return
    }

    client.addEventListener('userjoin', e => {
      const userId = e.detail.userId
      /* eslint-disable-next-line no-console */
      console.log(`[RTC] User joined, ID: ${userId}`)
      if (state.mixer) {
        state.mixer.playFileSource('qall_joined')
      }
    })

    client.addEventListener('userleave', async e => {
      const userId = e.detail.userId
      /* eslint-disable-next-line no-console */
      console.log(`[RTC] User left, ID: ${userId}`)
      commit.removeRemoteStream(userId)

      if (state.mixer) {
        await state.mixer.removeStream(userId)
        state.mixer.playFileSource('qall_left')
      }
    })

    client.addEventListener('streamchange', async e => {
      const stream = e.detail.stream
      const userId = stream.peerId
      /* eslint-disable-next-line no-console */
      console.log(`[RTC] Recieved stream from ${stream.peerId}`)
      commit.addRemoteStream({ userId, mediaStream: stream })

      if (state.mixer) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await state.mixer.addStream(stream.peerId, stream)
      }
      commit.setUserVolume({ userId, volume: 1 / maxGain })
    })

    const localStream = await getUserAudio(
      rootState.app.rtcSettings.audioInputDeviceId
    )
    commit.setLocalStream(localStream)

    if (state.isMicMuted) {
      dispatch.muteLocalStream()
    } else {
      dispatch.unmuteLocalStream()
    }

    await client.joinRoom(room, localStream)

    state.mixer.playFileSource('qall_start')
  },
  muteLocalStream(context) {
    const { state, commit, getters } = rtcActionContext(context)
    if (!state.localStream || !getters.qallState) {
      return
    }
    commit.muteLocalStream()
    const currentStateList = getters.qallState.state.split('.')
    if (!currentStateList.find(s => s === 'micmuted')) {
      currentStateList.push('micmuted')
    }
    const newState = currentStateList.join('.')
    commit.modifyCurrentRTCSessionBySessionType({
      sessionType: 'qall',
      sessionState: newState
    })
  },
  unmuteLocalStream(context) {
    const { state, commit, getters } = rtcActionContext(context)
    if (!state.localStream || !getters.qallState) {
      return
    }
    commit.unmuteLocalStream()
    const newState = getters.qallState.state
      .split('.')
      .filter(s => s !== 'micmuted')
      .join('.')
    commit.modifyCurrentRTCSessionBySessionType({
      sessionType: 'qall',
      sessionState: newState
    })
  },

  // ---- Specific RTC Session ---- //
  async startQall(context, channelId: ChannelId) {
    const { dispatch } = rtcActionContext(context)
    await dispatch.establishConnection()
    const sessionId = await dispatch.startOrJoinRTCSession({
      channelId,
      sessionType: 'qall'
    })
    /* eslint-disable-next-line no-console */
    console.log(`[RTC] Got session id: ${sessionId}`)
    dispatch.joinVoiceChannel(sessionId)
  },

  async endQall(context) {
    const { commit, dispatch } = rtcActionContext(context)
    await dispatch.closeConnection()
    commit.removeCurrentRTCSessionBySessionType('qall')
  }
})
