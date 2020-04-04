import { UserId, ChannelId } from '@/types/entity-ids'

type ModalStateType = 'user' | 'group' | 'notification' | 'setting'

export type ModalState =
  | UserModalState
  | NotificationModalState
  | SettingModalState

interface BaseModalState {
  type: ModalStateType
}

interface UserModalState extends BaseModalState {
  type: 'user'
  id: UserId
}

interface NotificationModalState extends BaseModalState {
  type: 'notification'
  channelId: ChannelId
}

interface SettingModalState extends BaseModalState {
  type: 'setting'
}

export interface S {
  modalState: ModalState[]
}

export const state: S = {
  modalState: []
}
