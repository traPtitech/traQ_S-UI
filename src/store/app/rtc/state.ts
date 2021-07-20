import { UserId } from '/@/types/entity-ids'
import AudioStreamMixer from '/@/lib/audioStreamMixer'

export interface ExtendedMediaStream extends MediaStream {
  userMuted?: boolean
}

export type S = {
  /** ミキサー */
  mixer?: AudioStreamMixer

  /** 送信するMediaStream */
  localStream?: ExtendedMediaStream

  /** 送信するMediaStreamのAnalyzerNode */
  localAnalyzerNode?: Readonly<AnalyserNode>

  /** マイクミュート */
  isMicMuted: boolean

  /** ローカルで指定するユーザー音量のマップ */
  userVolumeMap: Map<UserId, number>

  /** 他ユーザーのオーディオ */
  remoteAudioStreamMap: Map<UserId, MediaStream>

  /** 現在発話しているユーザーを判定するsetIntervalのID */
  talkingStateUpdateId: number

  /** 現在発話してるユーザーの声の大きさのレベル */
  talkingUsersState: Map<UserId, number>
}

export const state: S = {
  mixer: undefined,
  localStream: undefined,
  localAnalyzerNode: undefined,
  isMicMuted: false,
  userVolumeMap: new Map(),
  remoteAudioStreamMap: new Map(),
  talkingStateUpdateId: 0,
  talkingUsersState: new Map()
}
