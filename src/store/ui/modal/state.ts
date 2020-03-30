import { UserId, ChannelId } from '@/types/entity-ids'

type ModalStateType = 'user' | 'group' | 'notification'

export type ModalState = UserModalState | NotificationModalState

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

export interface S {
  modalState: ModalState[]
}

export const state: S = {
  modalState: []
}
