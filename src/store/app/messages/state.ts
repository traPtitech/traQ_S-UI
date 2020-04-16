import { ChannelId } from '@/types/entity-ids'
import { MessageFormState } from './index'

export interface S {
  messageFormMap: Record<ChannelId, MessageFormState | undefined>
}

export const state: S = {
  messageFormMap: {}
}
