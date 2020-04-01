import { SendKey, OpenMode } from '.'
import { ChannelId } from '@/types/entity-ids'

export interface S {
  openMode: OpenMode
  lastOpenChannel: ChannelId | null
  openChannelId: ChannelId | null
  sendKey: SendKey[] | null
  ecoMode: boolean
}

export const state: S = {
  openMode: 'particular',
  lastOpenChannel: null,
  openChannelId: null,
  sendKey: ['alt', 'ctrl', 'shift'],
  ecoMode: false
}
