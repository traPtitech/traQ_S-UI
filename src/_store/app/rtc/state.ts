import { UserId } from '@/types/entity-ids'
import AudioStreamMixer from '@/lib/audioStreamMixer'

export interface ExtendedMediaStream extends MediaStream {
  userMuted?: boolean
}

export interface S {
  /** ミキサー */
  mixer?: AudioStreamMixer

  /** 送信するMediaStream */
  localStream?: ExtendedMediaStream

  /** 送信するMediaStreamのAnalyzerNode */
  localAnalyzerNode?: Readonly<AnalyserNode>

  /** マイクミュート */
  isMicMuted: boolean

  /** ローカルで指定するユーザー音量のマップ */
  userVolumeMap: Record<UserId, number | undefined>

  /** 他ユーザーのオーディオ */
  remoteAudioStreamMap: Record<UserId, MediaStream | undefined>

  /** 現在発話しているユーザーを判定するsetIntervalのID */
  talkingStateUpdateId: number

  /** 現在発話してるユーザーの声の大きさのレベル */
  talkingUsersState: Record<UserId, number>
}

export const state: S = {
  mixer: undefined,
  localStream: undefined,
  localAnalyzerNode: undefined,
  isMicMuted: false,
  userVolumeMap: {},
  remoteAudioStreamMap: {},
  talkingStateUpdateId: 0,
  talkingUsersState: {}
}
