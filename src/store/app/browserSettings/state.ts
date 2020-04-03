import { SendKeys, OpenMode } from '.'
import { ChannelId } from '@/types/entity-ids'

export interface S {
  openMode: OpenMode
  lastOpenChannel: ChannelId | null
  openChannelId: ChannelId | null
  sendKey: SendKeys
  ecoMode: boolean
}

export const state: S = {
  openMode: 'particular',
  lastOpenChannel: null,
  openChannelId: null,
  sendKey: { alt: true, ctrl: true, shift: true },
  ecoMode: false
}
