import { ChannelId } from '@/types/entity-ids'

export interface S {
  loaded: boolean
  componentLoaded: boolean
  currentChannelId: ChannelId
}

export const state: S = {
  loaded: false,
  componentLoaded: false,
  currentChannelId: ''
}
