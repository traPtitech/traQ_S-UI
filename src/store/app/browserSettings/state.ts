import { SendKey } from '.'

export interface S {
  sendKey: SendKey[] | null
}

export const state: S = {
  sendKey: ['alt', 'ctrl', 'shift']
}
