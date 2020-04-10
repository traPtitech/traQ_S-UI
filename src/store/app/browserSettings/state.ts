import { SendKey, OpenMode } from '.'
import { ChannelId } from '@/types/entity-ids'

export interface S {
  openMode: OpenMode
  lastOpenChannel: ChannelId | null
  openChannelName: string

  sendWithModifierKey: SendKey
  /**
   * Windows: Alt, Mac: ⌥(Option)
   */
  modifierAlt: boolean
  /**
   * Windows: Ctrl, Mac: ⌘(Command)
   */
  modifierCtrl: boolean
  /**
   * Windows: Shift, Mac: Shift
   */
  modifierShift: boolean
  /**
   * Windows: なし, Mac: Ctrl
   */
  modifierMacCtrl: boolean

  ecoMode: boolean
}

export const state: S = {
  openMode: 'particular',
  lastOpenChannel: null,
  openChannelName: 'general',
  sendWithModifierKey: 'modifier',
  modifierAlt: true,
  modifierCtrl: true,
  modifierShift: true,
  modifierMacCtrl: true,
  ecoMode: false
}
