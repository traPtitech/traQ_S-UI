import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, markRaw, ref, watch } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import ExtendedAudioContext from '/@/lib/webrtc/ExtendedAudioContext'
import AudioStreamMixer from '/@/lib/webrtc/AudioStreamMixer'
import LocalStreamManager from '/@/lib/webrtc/LocalStreamManager'
import type { ChannelId, UserId } from '/@/types/entity-ids'
import { getTalkingLoudnessLevel } from '/@/lib/webrtc/loudness'
import { useRtcSettings } from '/@/store/app/rtcSettings'
import { isIOSApp } from '/@/lib/dom/browser'
import { client, destroyClient, initClient } from '/@/lib/webrtc/traQRTCClient'
import type { SessionId, SessionType } from '/@/store/domain/rtc'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useMeStore } from '/@/store/domain/me'
import { getCurrentTimeString } from '/@/lib/basic/date'

const defaultState = 'joined'
const talkingStateUpdateFPS = 30

/**
 * 接続中のQallの情報を持つストア
 * 接続していないものも含むQallの情報はdomain/rtc
 */
const useAppRtcPinia = defineStore('app/rtc', () => {
  const rtcSettings = useRtcSettings()
  const domainRtcStore = useDomainRtcStore()
  const meStore = useMeStore()

  const audioContext = ref<ExtendedAudioContext>()
  const mixer = ref<AudioStreamMixer>()
  const localStreamManager = ref<LocalStreamManager>()

  const setContext = (input: {
    audioContext: ExtendedAudioContext
    mixer: AudioStreamMixer
    localStreamManager: LocalStreamManager
  }) => {
    audioContext.value = markRaw(input.audioContext)
    mixer.value = markRaw(input.mixer)
    localStreamManager.value = markRaw(input.localStreamManager)
  }
  const unsetContext = () => {
    audioContext.value = undefined
    mixer.value = undefined
    localStreamManager.value = undefined
  }

  /** マイクミュート */
  const muteLocalStream = () => {
    if (!localStreamManager.value) return
    localStreamManager.value.mute()
    rtcSettings.isMute.value = true
  }
  const unmuteLocalStream = () => {
    if (!localStreamManager.value) return
    localStreamManager.value.unmute()
    rtcSettings.isMute.value = false
  }

  /** 現在発話しているユーザーを判定するsetIntervalのID */
  let talkingStateUpdateId = 0
  const startTalkingStateUpdate = () => {
    const id = window.setInterval(() => {
      const myId = meStore.myId.value
      const userStateDiff = new Map<UserId, number>()

      domainRtcStore.currentSessionUsers.value.forEach(userId => {
        if (userId === myId) return

        const loudness = domainRtcStore.currentMutedUsers.value.has(userId)
          ? 0
          : getTalkingLoudnessLevel(mixer.value?.getLevelOfStream(userId) ?? 0)
        if (talkingUsersState.value.get(userId) !== loudness) {
          userStateDiff.set(userId, loudness)
        }
      })

      if (localStreamManager.value && myId) {
        const level = localStreamManager.value.getLevel()
        const loudness = getTalkingLoudnessLevel(level)
        if (talkingUsersState.value.get(myId) !== loudness) {
          userStateDiff.set(myId, loudness)
        }
      }

      userStateDiff.forEach((loudnessLevel, userId) => {
        talkingUsersState.value.set(userId, loudnessLevel)
      })
    }, 1000 / talkingStateUpdateFPS)
    talkingStateUpdateId = id
  }
  const stopTalkingStateUpdate = () => {
    clearInterval(talkingStateUpdateId)
  }

  /** 現在発話してるユーザーの声の大きさのレベル */
  const talkingUsersState = ref(new Map<UserId, number>())

  const isCurrentDevice = computed(() => mixer.value !== undefined)

  const setUserVolume = (userId: UserId, volume: number) => {
    mixer.value?.setStreamVolume(userId, volume)
  }
  const streamVolumeMap = ref(new Map<string, number>())
  const onStreamVolumeChange = (key: string) => {
    if (!mixer.value) return
    streamVolumeMap.value.set(key, mixer.value.getStreamVolume(key))
  }
  watch(
    mixer,
    (newMixer, oldMixer) => {
      if (oldMixer) {
        oldMixer.listener.off('streamVolumeChange', onStreamVolumeChange)
      }
      if (newMixer) {
        streamVolumeMap.value = new Map()
        newMixer.listener.on('streamVolumeChange', onStreamVolumeChange)
      }
    },
    { immediate: true }
  )

  const startOrJoinRTCSession = ({
    channelId,
    sessionType
  }: {
    channelId: ChannelId
    sessionType: SessionType
  }) => {
    if (
      domainRtcStore.currentRTCState.value &&
      domainRtcStore.currentRTCState.value.channelId !== channelId
    ) {
      throw `RTC session is already open for channel ${channelId}`
    }

    const sessionId = `${sessionType}-${channelId}` as const

    domainRtcStore.addRTCSession(channelId, {
      sessionId,
      states: [defaultState]
    })
    return sessionId
  }

  const ensureDevicePermission = async () => {
    if (!rtcSettings.isEnabled.value) {
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
    if (!(await rtcSettings.ensureDeviceIds())) {
      window.alert('マイクの設定に失敗しました')
      return false
    }
    return true
  }

  const initializeContext = async () => {
    const audioContext = new ExtendedAudioContext()
    const mixer = new AudioStreamMixer(
      audioContext,
      rtcSettings.masterVolume.value
    )
    const localStreamManager = new LocalStreamManager(audioContext, {
      outputNode: mixer.masterVolumeGain,
      audioInputDeviceId: rtcSettings.audioInputDeviceId.value,
      noiseSuppression: rtcSettings.noiseSuppression.value,
      noiseGateThreshold: rtcSettings.noiseGateThreshold.value
    })

    await Promise.all([
      mixer.initializePromise,
      localStreamManager.initializePromise
    ])
    setContext({ audioContext, mixer, localStreamManager }) // initializeが終わってからセットすること
  }

  const logRTC = (message: string) => {
    // eslint-disable-next-line no-console
    console.log(`[RTC] (${getCurrentTimeString()}) ${message}`)
  }

  const establishConnection = async () => {
    const myId = meStore.myId.value
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

      closeConnection()
      // session接続後にCredential expiredで切れる場合は退出しないといけない
      const qallSession = domainRtcStore.qallSession.value
      if (qallSession) {
        domainRtcStore.removeRTCSession(qallSession.sessionId)
      }
    })
    client?.addEventListener('connectionclose', () => {
      logRTC('connection closed')
    })
    await client?.establishConnection()
  }

  const closeConnection = () => {
    if (!client) {
      return
    }

    const audioContextVal = audioContext.value
    mixer.value?.playFileSource('qall_end').then(() => {
      // closeConnectionなどの処理をqall_endの再生が終わるのを待っていないのは
      // これを待つと接続解除がかなり後になるため
      // audioContextのcloseはqall_endを待たないと音がならなくなるので、
      // これに限って待っている
      audioContextVal?.close()
    })
    stopTalkingStateUpdate()
    localStreamManager.value?.deinitialize()
    unsetContext()

    client.closeConnection()
    destroyClient()
  }

  const joinVoiceChannel = async (room: SessionId) => {
    if (!client) {
      throw new Error('client not initialized')
    }

    await initializeContext()
    if (!mixer.value) {
      throw new Error('mixer not initialized')
    }
    if (!localStreamManager.value) {
      throw new Error('localStreamManager not initialized')
    }
    startTalkingStateUpdate()

    client.addEventListener('userjoin', async e => {
      const userId = e.detail.userId
      logRTC(`User joined, ID: ${userId}`)
      await mixer.value?.playFileSource('qall_joined')
    })

    client.addEventListener('userleave', async e => {
      const userId = e.detail.userId
      logRTC(`User left, ID: ${userId}`)

      if (mixer.value) {
        await mixer.value.stopAndRemoveStream(userId)
        await mixer.value.playFileSource('qall_left')
      }
    })

    client.addEventListener('streamchange', async e => {
      const stream = e.detail.stream
      const userId = stream.peerId
      logRTC(`Recieved stream from ${userId}`)

      await mixer.value?.addAndPlayStream(stream.peerId, stream)
      setUserVolume(userId, 0.5)
    })

    if (rtcSettings.isMute.value) {
      mute()
    } else {
      unmute()
    }

    client.joinRoom(room, localStreamManager.value.outputStream)

    await mixer.value.playFileSource('qall_start')
  }

  watch(rtcSettings.masterVolume, newMasterVolume => {
    mixer.value?.setMasterVolume(newMasterVolume)
  })
  watch(rtcSettings.audioInputDeviceId, newAudioInputDeviceId => {
    localStreamManager.value?.setAudioInputDevice(newAudioInputDeviceId)
  })
  watch(rtcSettings.noiseSuppression, newNoiseSuppression => {
    localStreamManager.value?.setNoiseSuppression(newNoiseSuppression)
  })
  watch(rtcSettings.noiseGateThreshold, newNoiseGateThreshold => {
    localStreamManager.value?.setNoiseGateThreshold(newNoiseGateThreshold)
  })

  const mute = () => {
    const qallSession = domainRtcStore.qallSession.value
    if (!localStreamManager.value || !qallSession) {
      return
    }
    muteLocalStream()
    const statesSet = new Set(qallSession.states)
    statesSet.add('micmuted')
    domainRtcStore.modifyRTCSession(qallSession.sessionId, [...statesSet])
  }
  const unmute = () => {
    const qallSession = domainRtcStore.qallSession.value
    if (!localStreamManager.value || !qallSession) {
      return
    }
    unmuteLocalStream()
    const stateSet = new Set(qallSession.states)
    stateSet.delete('micmuted')
    domainRtcStore.modifyRTCSession(qallSession.sessionId, [...stateSet])
  }

  const startQall = async (channelId: ChannelId) => {
    if (!(await ensureDevicePermission())) {
      return
    }

    await establishConnection()
    const sessionId = startOrJoinRTCSession({
      channelId,
      sessionType: 'qall'
    })
    await joinVoiceChannel(sessionId)
  }
  const endQall = async () => {
    const qallSession = domainRtcStore.qallSession.value
    if (!qallSession) {
      throw 'something went wrong'
    }

    domainRtcStore.removeRTCSession(qallSession.sessionId)
    closeConnection()
  }

  return {
    isCurrentDevice,
    isMicMuted: rtcSettings.isMute,
    talkingUsersState,
    startQall,
    endQall,
    mute,
    unmute,
    streamVolumeMap,
    setUserVolume
  }
})

export const useAppRtcStore = convertToRefsStore(useAppRtcPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppRtcPinia, import.meta.hot))
}
