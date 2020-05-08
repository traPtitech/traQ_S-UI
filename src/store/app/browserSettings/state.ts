import { SendKey, OpenMode, SendKeys, ActivityMode } from '.'

export interface S {
  openMode: OpenMode
  lastOpenChannelName: string
  openChannelName: string
  sendWithModifierKey: SendKey
  modifierKey: SendKeys
  ecoMode: boolean
  activityMode: ActivityMode
  filterStarChannel: boolean
}

export const state: S = {
  openMode: 'particular',
  lastOpenChannelName: 'general',
  openChannelName: 'general',
  sendWithModifierKey: 'modifier',
  modifierKey: { alt: true, ctrl: true, shift: true, macCtrl: true },
  ecoMode: false,
  activityMode: { all: false, perChannel: false },
  filterStarChannel: false
}
