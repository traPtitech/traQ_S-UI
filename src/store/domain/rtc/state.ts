import { ChannelId, UserId } from '/@/types/entity-ids'

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

export type S = {
  /** 一度でも取得が完了したかどうか */
  rtcStateFetched: boolean

  /** ユーザーのRTC状態のマップ */
  userStateMap: Map<UserId, UserRTCState>
  /** チャンネルIDと立っているセッションIDのマップ */
  channelSessionsMap: Map<ChannelId, Set<SessionId>>
  /** セッションIDとセッションの状態のマップ */
  sessionInfoMap: Map<SessionId, SessionInfo>
  /** セッションIDとセッションの状態のマップ */
  sessionUsersMap: Map<SessionId, Set<UserId>>
}

export const state: S = {
  rtcStateFetched: false,
  userStateMap: new Map(),
  channelSessionsMap: new Map(),
  sessionInfoMap: new Map(),
  sessionUsersMap: new Map()
}
