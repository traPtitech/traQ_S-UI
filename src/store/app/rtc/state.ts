import { UserId, ChannelId } from '@/types/entity-ids'
import AudioStreamMixer from '@/lib/audioStreamMixer'
import { WebRTCUserState, WebRTCUserStateSessions } from '@traptitech/traq'

export interface S {
  /** ミキサー */
  mixer?: AudioStreamMixer

  /** 送信するMediaStream */
  localStream?: MediaStream

  /** マイクミュート */
  isMicMuted: boolean

  /** 自分が参加しているRTCセッションのチャンネルID */
  currentRTCChannel?: ChannelId

  /** 自分が参加しているRTCセッション */
  currentRTCSessions: WebRTCUserStateSessions[]

  /** ユーザーのRTC状態のマップ */
  userStateMap: Record<UserId, WebRTCUserState>

  /** ローカルで指定するユーザー音量のマップ */
  userVolumeMap: Record<UserId, number | undefined>

  /** 他ユーザーのオーディオ */
  remoteAudioStreamMap: Record<UserId, MediaStream | undefined>

  /** 現在発話しているユーザーを判定するsetIntervalのID */
  talkingStateUpdateIntervalId: number
}

export const state: S = {
  mixer: undefined,
  localStream: undefined,
  currentRTCChannel: undefined,
  currentRTCSessions: [],
  isMicMuted: false,
  userStateMap: {},
  userVolumeMap: {},
  remoteAudioStreamMap: {},
  talkingStateUpdateIntervalId: 0
}
