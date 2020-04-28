import { SendKey, OpenMode, SendKeys, ActivityMode } from '.'
import { ChannelId } from '@/types/entity-ids'

export interface S {
  openMode: OpenMode
  lastOpenChannel: ChannelId | null
  openChannelName: string
  sendWithModifierKey: SendKey
  modifierKey: SendKeys
  ecoMode: boolean
  activityMode: ActivityMode
}

export const state: S = {
  openMode: 'particular',
  lastOpenChannel: null,
  openChannelName: 'general',
  sendWithModifierKey: 'modifier',
  modifierKey: { alt: true, ctrl: true, shift: true, macCtrl: true },
  ecoMode: false,
  activityMode: { all: false, perChannel: false }
}
