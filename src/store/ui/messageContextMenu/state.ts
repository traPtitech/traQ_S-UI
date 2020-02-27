import { MessageId } from '@/types/entity-ids'

export interface S {
  target?: MessageId
}

export const state: S = {
  target: undefined
}
