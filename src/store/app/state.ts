import { UserId, MessageId } from '@/types/entity-ids'

export interface S {
  loaded: boolean
  componentLoaded: boolean
  currentChannelId: UserId
}

export const state: S = {
  loaded: false,
  componentLoaded: false,
  currentChannelId: ''
}
