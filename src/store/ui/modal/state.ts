import { UserId } from '@/types/entity-ids'
import { UserDetail } from '@traptitech/traq'

type ModalStateType = 'user' | 'group'

export type ModalState = UserModalState

interface BaseModalState {
  type: ModalStateType
}

interface UserModalState extends BaseModalState {
  type: 'user'
  id: UserId
}

export interface S {
  modalState: ModalState[]
  userDetails: Record<UserId, UserDetail>
}

export const state: S = {
  modalState: [],
  userDetails: {}
}
