import { UserId, ChannelId } from '@/types/entity-ids'
import { WebRTCUserState, WebRTCUserStateSessions } from '@traptitech/traq'

export interface S {
  // client?: traQRTCClient
  // mixer?: AudioStreamMixer
  localStream?: MediaStream
  rtcState: string[]
  isMicMuted: boolean
  activeMediaChannelId: ChannelId

  /** ユーザーのRTC状態のマップ */
  userStateMap: Record<UserId, WebRTCUserState>

  /** チャンネルで行われているRTCセッションのマップ */
  channelSessionsMap: Record<ChannelId, WebRTCUserStateSessions[]>

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
  rtcState: [],
  isMicMuted: false,
  activeMediaChannelId: '',
  userStateMap: {},
  channelSessionsMap: {},
  userVolumeMap: {},
  remoteAudioStreamMap: {},
  remoteVideoStreamMap: {},
  talkingStateUpdateIntervalId: 0
}
