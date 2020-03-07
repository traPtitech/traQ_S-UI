import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { MessageId, WebhookId, StampId, ChannelId } from '@/types/entity-ids'

export const mutations = defineMutations<S>()({
  setId(state: S, id: MessageId) {
    state.id = id
  },
  setWebhooks(state: S, webhooks: WebhookId[]) {
    state.webhooks = webhooks
  },
  setStampHistory(state: S, stampHistory: StampId[]) {
    state.stampHistory = stampHistory
  },
  setUnreadChannels(state: S, unreadChannels: ChannelId[]) {
    state.unreadChannels = unreadChannels
  },
  setSubscribedChannels(state: S, subscribedChannels: ChannelId[]) {
    state.subscribedChannels = subscribedChannels
  },
  setNotifiedChannels(state: S, notifiedChannels: ChannelId[]) {
    state.notifiedChannels = notifiedChannels
  }
})
