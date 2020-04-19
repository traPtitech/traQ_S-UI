import { MessageId } from '@/types/entity-ids'

export interface S {
  target?: MessageId
  position: { x: number; y: number }
}

export const state: S = {
  target: undefined,
  position: { x: 0, y: 0 }
}
