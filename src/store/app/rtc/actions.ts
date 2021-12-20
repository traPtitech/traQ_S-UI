import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { rtc } from '.'
import { ChannelId, UserId } from '/@/types/entity-ids'
import { client, initClient, destroyClient } from '/@/lib/webrtc/traQRTCClient'
import AudioStreamMixer from '/@/lib/webrtc/AudioStreamMixer'
import { ActionContext } from 'vuex'
import { tts } from '/@/lib/tts'
import { isIOSApp } from '/@/lib/dom/browser'
import { SessionId, SessionType } from '/@/store/domain/rtc/state'
import ExtendedAudioContext from '/@/lib/webrtc/ExtendedAudioContext'
import LocalStreamManager from '/@/lib/webrtc/LocalStreamManager'
import { dtlnSampleRate } from '/@/lib/webrtc/dtln-web'

const defaultState = 'joined'
const talkingStateUpdateFPS = 30
const talkingThreshoulds = [300, 1000, 3000, 5000]

const getTalkingLoudnessLevel = (level: number) => {
  let ll = 0
  for (const t of talkingThreshoulds) {
    if (level < t) return ll
    ll++
  }
  return ll
}

export const rtcActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, rtc)

const updateTalkingUserState = (context: ActionContext<unknown, unknown>) => {
  const { rootGetters, state, commit } = rtcActionContext(context)
  const update = () => {
    const myId = rootGetters.domain.me.myId
    const userStateDiff = new Map<UserId, number>()

    rootGetters.domain.rtc.currentSessionUsers.forEach(userId => {
      if (userId === myId) return

      const loudness = rootGetters.domain.rtc.currentMutedUsers.has(userId)
        ? 0
        : getTalkingLoudnessLevel(state.mixer?.getLevelOfStream(userId) ?? 0)
      if (state.talkingUsersState.get(userId) !== loudness) {
        userStateDiff.set(userId, loudness)
      }
    })

    if (state.localStreamManager && myId) {
      const level = state.localStreamManager.getLevel()
      const loudness = getTalkingLoudnessLevel(level)
      if (state.talkingUsersState.get(myId) !== loudness) {
        userStateDiff.set(myId, loudness)
      }
    }

    commit.updateTalkingUserState(userStateDiff)
  }
  const id = window.setInterval(update, 1000 / talkingStateUpdateFPS)
  commit.setTalkingStateUpdateId(id)
}

export const actions = defineActions({
  startOrJoinRTCSession(
    context,
    {
      channelId,
      sessionType
    }: { channelId: ChannelId; sessionType: SessionType }
  ) {
    const { rootGetters, rootDispatch } = rtcActionContext(context)
    if (
      rootGetters.domain.rtc.currentRTCState &&
      rootGetters.domain.rtc.currentRTCState.channelId !== channelId
    ) {
      throw `RTC session is already open for channel ${channelId}`
    }

    const sessionId = `${sessionType}-${channelId}` as const

    rootDispatch.domain.rtc.addRTCSession({
      channelId,
      state: {
        sessionId,
        states: [defaultState]
      }
    })
    return sessionId
  },

  // ---- RTC Connection ---- //
  async ensureDevicePermission(context) {
    const { rootDispatch, rootState } = rtcActionContext(context)
    if (!rootState.app.rtcSettings.isEnabled) {
      return false
    }
    if (
      isIOSApp(window) &&
      !(await window.webkit.messageHandlers.scriptMessageHandler.postMessage(
        'RequestMicrophone'
      ))
    ) {
      window.alert('設定アプリからマイクの使用を許可してください')
      return false
    }
    if (!(await rootDispatch.app.rtcSettings.ensureDeviceIds())) {
      window.alert('マイクの設定に失敗しました')
      return false
    }
    return true
  },

  async initializeContext(context) {
    const { commit, rootState } = rtcActionContext(context)
    const rtcSettingsState = rootState.app.rtcSettings

    const audioContext = new ExtendedAudioContext({
      sampleRate: dtlnSampleRate
    })
    const mixer = new AudioStreamMixer(
      audioContext,
      rtcSettingsState.masterVolume
    )
    const localStreamManager = new LocalStreamManager(audioContext, {
      outputNode: mixer.masterVolumeGain,
      audioInputDeviceId: rtcSettingsState.audioInputDeviceId,
      enableNoiseReduction: rtcSettingsState.isNoiseReductionEnabled,
      enableEchoCancellation: rtcSettingsState.isEchoCancellationEnabled
    })

    await Promise.all([
      mixer.initializePromise,
      localStreamManager.initializePromise
    ])
    commit.setContext({ audioContext, mixer, localStreamManager }) // initializeが終わってからセットすること
  },

  async establishConnection(context) {
    const { rootGetters, dispatch, rootDispatch } = rtcActionContext(context)
    const myId = rootGetters.domain.me.myId
    if (!myId) {
      throw 'application not initialized'
    }

    client?.closeConnection()

    initClient(myId)
    client?.addEventListener('connectionerror', async e => {
      if (e.detail.err.type === 'unavailable-id') {
        // eslint-disable-next-line no-console
        console.error(
          '[RTC] Failed to establish connection: Peer Id already in use!'
        )
      } else {
        // eslint-disable-next-line no-console
        console.error('[RTC] Failed to establish connection', e.detail.err)
      }
      window.alert('接続に失敗しました')

      await dispatch.closeConnection()
      // session接続後にCredential expiredで切れる場合は退出しないといけない
      const qallSession = rootGetters.domain.rtc.qallSession
      if (qallSession) {
        rootDispatch.domain.rtc.removeRTCSession({
          sessionId: qallSession.sessionId
        })
        tts.stop()
      }
    })
    client?.addEventListener('connectionclose', () => {
      // eslint-disable-next-line no-console
      console.log('[RTC] connection closed')
    })
    await client?.establishConnection()
  },

  async closeConnection(context) {
    const { state, commit, dispatch } = rtcActionContext(context)
    if (!client) {
      return
    }

    const { audioContext } = state
    state.mixer?.playFileSource('qall_end').then(() => {
      // closeConnectionなどの処理をqall_endの再生が終わるのを待っていないのは
      // これを待つと接続解除がかなり後になるため
      // audioContextのcloseはqall_endを待たないと音がならなくなるので、
      // これに限って待っている
      audioContext?.close()
    })
    dispatch.stopTalkStateUpdate()
    if (state.localStreamManager) {
      state.localStreamManager.deinitialize()
    }
    commit.unsetContext()

    client.closeConnection()
    destroyClient()
  },

  async joinVoiceChannel(context, room: SessionId) {
    const { state, commit, dispatch, rootState } = rtcActionContext(context)
    if (!client) {
      throw new Error('client not initialized')
    }

    await dispatch.initializeContext()
    if (!state.mixer) {
      throw new Error('mixer not initialized')
    }
    if (!state.localStreamManager) {
      throw new Error('localStreamManager not initialized')
    }
    dispatch.startTalkStateUpdate()

    client.addEventListener('userjoin', async e => {
      const userId = e.detail.userId
      // eslint-disable-next-line no-console
      console.log(`[RTC] User joined, ID: ${userId}`)
      await state.mixer?.playFileSource('qall_joined')
    })

    client.addEventListener('userleave', async e => {
      const userId = e.detail.userId
      // eslint-disable-next-line no-console
      console.log(`[RTC] User left, ID: ${userId}`)

      if (state.mixer) {
        await state.mixer.stopAndRemoveStream(userId)
        await state.mixer.playFileSource('qall_left')
      }
    })

    client.addEventListener('streamchange', async e => {
      const stream = e.detail.stream
      const userId = stream.peerId
      // eslint-disable-next-line no-console
      console.log(`[RTC] Recieved stream from ${userId}`)

      await state.mixer?.addAndPlayStream(stream.peerId, stream)
      commit.setUserVolume({ userId, volume: 0.5 })
    })

    if (state.isMicMuted) {
      await dispatch.mute()
    } else {
      await dispatch.unmute()
    }

    client.joinRoom(room, state.localStreamManager.outputStream)

    await state.mixer.playFileSource('qall_start')
  },
  async setAudioInputDeviceId(context, audioInputDeviceId: string) {
    const { state } = rtcActionContext(context)
    if (!state.localStreamManager) {
      return
    }

    await state.localStreamManager.setAudioInputDevice(audioInputDeviceId)
  },
  async setIsNoiseReductionEnabled(context, isNoiseReductionEnabled: boolean) {
    const { state } = rtcActionContext(context)
    if (!state.localStreamManager) {
      return
    }

    await state.localStreamManager.setEnableNoiseReduction(
      isNoiseReductionEnabled
    )
  },
  async setIsEchoCancellationEnabled(
    context,
    isEchoCancellationEnabled: boolean
  ) {
    const { state } = rtcActionContext(context)
    if (!state.localStreamManager) {
      return
    }

    await state.localStreamManager.setEnableNoiseReduction(
      isEchoCancellationEnabled
    )
  },
  mute(context) {
    const { state, commit, rootGetters, rootDispatch } =
      rtcActionContext(context)
    const qallSession = rootGetters.domain.rtc.qallSession
    if (!state.localStreamManager || !qallSession) {
      return
    }
    commit.muteLocalStream()
    const statesSet = new Set(qallSession.states)
    statesSet.add('micmuted')
    rootDispatch.domain.rtc.modifyRTCSession({
      sessionId: qallSession.sessionId,
      states: [...statesSet]
    })
  },
  unmute(context) {
    const { state, commit, rootGetters, rootDispatch } =
      rtcActionContext(context)
    const qallSession = rootGetters.domain.rtc.qallSession
    if (!state.localStreamManager || !qallSession) {
      return
    }
    commit.unmuteLocalStream()
    const stateSet = new Set(qallSession.states)
    stateSet.delete('micmuted')
    rootDispatch.domain.rtc.modifyRTCSession({
      sessionId: qallSession.sessionId,
      states: [...stateSet]
    })
  },

  startTalkStateUpdate(context) {
    updateTalkingUserState(context)
  },
  stopTalkStateUpdate(context) {
    const { state } = rtcActionContext(context)
    clearInterval(state.talkingStateUpdateId)
  },

  // ---- Specific RTC Session ---- //
  async startQall(context, channelId: ChannelId) {
    const { dispatch } = rtcActionContext(context)
    if (!(await dispatch.ensureDevicePermission())) {
      return
    }

    await dispatch.establishConnection()
    const sessionId = await dispatch.startOrJoinRTCSession({
      channelId,
      sessionType: 'qall'
    })
    dispatch.joinVoiceChannel(sessionId)
  },

  async endQall(context) {
    const { dispatch, rootGetters, rootDispatch } = rtcActionContext(context)
    const qallSession = rootGetters.domain.rtc.qallSession
    if (!qallSession) {
      throw 'something went wrong'
    }
    await dispatch.closeConnection()
    rootDispatch.domain.rtc.removeRTCSession({
      sessionId: qallSession.sessionId
    })

    tts.stop()
  }
})
