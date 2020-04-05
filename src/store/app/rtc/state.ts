import { UserId, ChannelId } from '@/types/entity-ids'

export interface S {
  // client?: traQRTCClient
  // mixer?: AudioStreamMixer
  localStream?: MediaStream
  rtcState: string[]
  isMicMuted: boolean
  activeMediaChannelId: ChannelId
  // userStateMap: Record<string, WebRTCUserState>
  userVolumeMap: Record<UserId, number>
  remoteAudioStreamMap: Record<UserId, MediaStream>
  remoteVideoStreamMap: Record<UserId, MediaStream>
  talkingStateUpdateIntervalId: number
}

export const state: S = {
  // client?: undefined,
  // mixer?: undefined,
  localStream: undefined,
  rtcState: [],
  isMicMuted: false,
  activeMediaChannelId: '',
  // userStateMap: {},
  userVolumeMap: {},
  remoteAudioStreamMap: {},
  remoteVideoStreamMap: {},
  talkingStateUpdateIntervalId: 0
}
