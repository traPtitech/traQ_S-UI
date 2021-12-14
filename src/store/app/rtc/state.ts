import { UserId } from '/@/types/entity-ids'
import ExtendedAudioContext from '/@/lib/webrtc/ExtendedAudioContext'
import AudioStreamMixer from '/@/lib/webrtc/AudioStreamMixer'
import LocalStreamManager from '/@/lib/webrtc/LocalStreamManager'

export type S = {
  audioContext?: ExtendedAudioContext
  mixer?: AudioStreamMixer
  localStreamManager?: LocalStreamManager

  /** マイクミュート */
  isMicMuted: boolean

  /** 現在発話しているユーザーを判定するsetIntervalのID */
  talkingStateUpdateId: number

  /** 現在発話してるユーザーの声の大きさのレベル */
  talkingUsersState: Map<UserId, number>
}

export const state: S = {
  audioContext: undefined,
  mixer: undefined,
  localStreamManager: undefined,
  isMicMuted: false,
  talkingStateUpdateId: 0,
  talkingUsersState: new Map()
}
