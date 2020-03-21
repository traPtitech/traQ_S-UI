import { ChannelId, MessageId } from '@/types/entity-ids'
import { MessageFormState } from './index'

export interface S {
  messageFormMap: Record<ChannelId, MessageFormState>
}

export const state: S = {
  messageFormMap: {}
}
