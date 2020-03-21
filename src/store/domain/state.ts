import { ChannelId, MessageId } from '@/types/entity-ids'
import { Message } from '@/lib/api'
import { ChannelState } from './index'

export interface S {
  channelActivity: Message[]
  messageActivity: MessageId[]
  channelStateMap: Record<ChannelId, ChannelState>

  /** キャッシュ削除用 */
  channelStateUpdateHistory: ChannelId[]
}

export const state: S = {
  channelActivity: [],
  messageActivity: [],
  channelStateMap: {},
  channelStateUpdateHistory: []
}
