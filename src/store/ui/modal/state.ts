import { UserId, ChannelId, FileId } from '@/types/entity-ids'
import { RouteName } from '@/router'

type ModalStateType = 'user' | 'group' | 'notification' | 'file' | 'setting'

export type ModalState =
  | UserModalState
  | NotificationModalState
  | FileModalState
  | SettingModalState

interface BaseModalState {
  type: ModalStateType
  relatedRoute?: RouteName
}

interface UserModalState extends BaseModalState {
  type: 'user'
  id: UserId
}

interface NotificationModalState extends BaseModalState {
  type: 'notification'
  channelId: ChannelId
}

interface FileModalState extends BaseModalState {
  type: 'file'
  id: FileId
  relatedRoute: RouteName.File
}

interface SettingModalState extends BaseModalState {
  type: 'setting'
}

export interface S {
  modalState: ModalState[]

  /** ナビゲーションを挟むことなくモーダルを表示している状態か */
  isOnInitialModalRoute: boolean
}

export const state: S = {
  modalState: [],
  isOnInitialModalRoute: false
}
