import { MessageId } from '@/types/entity-ids'

export interface S {
  target?: MessageId | 'input'
}

export const state: S = {
  target: undefined
}
