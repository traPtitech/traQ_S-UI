import { UserId, ChannelId } from '@/types/entity-ids'

export interface S {
  // client?: traQRTCClient
  // mixer?: AudioStreamMixer
  localStream?: MediaStream
  rtcState: string[]
  isRtcEnabled: boolean
  isMicMuted: boolean
  activeMediaChannelId: ChannelId
  // userStateMap: Record<string, WebRTCUserState>
  userVolumeMap: Record<UserId, number>
  remoteAudioStreamMap: Record<UserId, MediaStream>
  remoteVideoStreamMap: Record<UserId, MediaStream>
  audioInputDeviceId: string
  audioOutputDeviceId: string
  talkingStateUpdateIntervalId: number
}

export const state: S = {
  // client?: undefined,
  // mixer?: undefined,
  localStream: undefined,
  rtcState: [],
  isRtcEnabled: false,
  isMicMuted: false,
  activeMediaChannelId: '',
  // userStateMap: {},
  userVolumeMap: {},
  remoteAudioStreamMap: {},
  remoteVideoStreamMap: {},
  audioInputDeviceId: '',
  audioOutputDeviceId: '',
  talkingStateUpdateIntervalId: 0
}
