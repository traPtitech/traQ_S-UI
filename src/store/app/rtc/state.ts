import { UserId, ChannelId } from '@/types/entity-ids'
import AudioStreamMixer from '@/lib/audioStreamMixer'

export type SessionId = string
export type SessionType = 'qall' | 'draw'
export type SessionInfoBase = {
  sessionId: SessionId
  type: SessionType
  channelId: ChannelId
}
export type QallSessionInfo = SessionInfoBase & { type: 'qall' }
export type DrawSessionInfo = SessionInfoBase & { type: 'draw' }
export type SessionInfo = QallSessionInfo | DrawSessionInfo
export type UserSessionState = {
  sessionId: SessionId
  states: string[]
}
export type UserRTCState = {
  channelId: ChannelId
  sessionStates: UserSessionState[]
}

export interface ExtendedMediaStream extends MediaStream {
  userMuted?: boolean
}

export interface S {
  /** ミキサー */
  mixer?: AudioStreamMixer

  /** 送信するMediaStream */
  localStream?: ExtendedMediaStream

  /** 送信するMediaStreamのAnalyzerNode */
  localAnalyzerNode?: AnalyserNode

  /** マイクミュート */
  isMicMuted: boolean

  /** 自分のRTC状態 */
  currentRTCState?: UserRTCState

  /** ユーザーのRTC状態のマップ */
  userStateMap: Record<UserId, UserRTCState | undefined>

  /** チャンネルIDと立っているセッションIDのマップ */
  channelSessionsMap: Record<ChannelId, SessionId[] | undefined>

  /** セッションIDとセッションの状態のマップ */
  sessionInfoMap: Record<SessionId, SessionInfo | undefined>

  /** セッションIDとセッションの状態のマップ */
  sessionUsersMap: Record<SessionId, UserId[] | undefined>

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
  currentRTCState: undefined,
  userStateMap: {},
  channelSessionsMap: {},
  sessionInfoMap: {},
  sessionUsersMap: {},
  userVolumeMap: {},
  remoteAudioStreamMap: {},
  talkingStateUpdateId: 0,
  talkingUsersState: {}
}
