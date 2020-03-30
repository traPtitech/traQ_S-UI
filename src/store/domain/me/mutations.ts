import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { MessageId, WebhookId, ChannelId, StampId } from '@/types/entity-ids'
import { UnreadChannel, StampHistoryEntry } from '@traptitech/traq'

export const mutations = defineMutations<S>()({
  setId(state: S, id: MessageId) {
    state.id = id
  },
  setWebhooks(state: S, webhooks: WebhookId[]) {
    state.webhooks = webhooks
  },
  setStampHistory(state: S, stampHistory: Record<StampId, Date>) {
    state.stampHistory = stampHistory
  },

  setUnreadChannelsSet(state: S, unreadChannels: UnreadChannel[]) {
    state.unreadChannelsSet = Object.fromEntries(
      unreadChannels.map(unread => [unread.channelId, unread])
    )
  },
  addUnreadChannel(state: S, unreadChannel: UnreadChannel) {
    if (!unreadChannel.channelId) throw 'addUnreadChannel: No Channel Id'
    Vue.set(state.unreadChannelsSet, unreadChannel.channelId, unreadChannel)
  },
  deleteUnreadChannel(state: S, channelId: ChannelId) {
    Vue.delete(state.unreadChannelsSet, channelId)
  },

  setSubscribedChannels(state: S, subscribedChannels: ChannelId[]) {
    state.subscribedChannels = subscribedChannels
  },
  setNotifiedChannels(state: S, notifiedChannels: ChannelId[]) {
    state.notifiedChannels = notifiedChannels
  },

  pushLocalStampHistory(state: S, stampHistory: StampHistoryEntry) {
    Vue.set(state.stampHistory, stampHistory.stampId, stampHistory.datetime)
  }
})
