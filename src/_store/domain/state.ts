import { UserId } from '@/types/entity-ids'
import { UserDetail } from '@traptitech/traq'

export interface S {
  onlineUsers: UserId[]
  userDetails: Record<UserId, UserDetail | undefined>
}

export const state: S = {
  onlineUsers: [],
  userDetails: {}
}
