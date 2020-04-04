import { UserId, ChannelId, FileId } from '@/types/entity-ids'
import { RouteName } from '@/router'

type ModalStateType = 'user' | 'group' | 'notification' | 'file'

export type ModalState =
  | UserModalState
  | NotificationModalState
  | FileModalState

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

export interface S {
  modalState: ModalState[]
}

export const state: S = {
  modalState: []
}
