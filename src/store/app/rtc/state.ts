import { UserId, ChannelId } from '@/types/entity-ids'
import { WebRTCUserState, WebRTCUserStateSessions } from '@traptitech/traq'

export interface S {
  // client?: traQRTCClient
  // mixer?: AudioStreamMixer
  localStream?: MediaStream
  isMicMuted: boolean
  activeMediaChannelId: ChannelId

  /** 自分が参加しているRTCセッションのチャンネルID */
  currentRTCChannel?: ChannelId

  /** 自分が参加しているRTCセッション */
  currentRTCSessions: WebRTCUserStateSessions[]

  /** ユーザーのRTC状態のマップ */
  userStateMap: Record<UserId, WebRTCUserState>

  /** ローカルで指定するユーザー音量のマップ */
  userVolumeMap: Record<UserId, number | undefined>

  remoteAudioStreamMap: Record<UserId, MediaStream | undefined>
  remoteVideoStreamMap: Record<UserId, MediaStream | undefined>

  talkingStateUpdateIntervalId: number
}

export const state: S = {
  // client?: undefined,
  // mixer?: undefined,
  localStream: undefined,
  currentRTCChannel: undefined,
  currentRTCSessions: [],
  isMicMuted: false,
  activeMediaChannelId: '',
  userStateMap: {},
  userVolumeMap: {},
  remoteAudioStreamMap: {},
  remoteVideoStreamMap: {},
  talkingStateUpdateIntervalId: 0
}
