import { UserId } from '/@/types/entity-ids'
import AudioStreamMixer from '/@/lib/webrtc/AudioStreamMixer'

export type S = {
  /** ミキサー */
  mixer?: AudioStreamMixer

  /** 送信するMediaStream */
  localStream?: MediaStream

  /** 送信するMediaStreamのAnalyzerNode */
  localStreamNodes?: Readonly<{
    source: MediaStreamAudioSourceNode
    analyzer: AnalyserNode
  }>

  /** マイクミュート */
  isMicMuted: boolean

  /** 現在発話しているユーザーを判定するsetIntervalのID */
  talkingStateUpdateId: number

  /** 現在発話してるユーザーの声の大きさのレベル */
  talkingUsersState: Map<UserId, number>
}

export const state: S = {
  mixer: undefined,
  localStream: undefined,
  localStreamNodes: undefined,
  isMicMuted: false,
  talkingStateUpdateId: 0,
  talkingUsersState: new Map()
}
