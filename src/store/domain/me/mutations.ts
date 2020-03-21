import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { MessageId, WebhookId, StampId, ChannelId } from '@/types/entity-ids'
import { UnreadChannel } from '@/lib/api'

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
  }
})
