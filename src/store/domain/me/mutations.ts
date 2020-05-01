import Vue from 'vue'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { WebhookId, ChannelId, StampId } from '@/types/entity-ids'
import {
  UnreadChannel,
  MyUserDetail,
  ChannelSubscribeLevel,
  Message
} from '@traptitech/traq'
import useDetecter from '@/use/detecter'

export const mutations = defineMutations<S>()({
  setDetail(state: S, detail: MyUserDetail) {
    state.detail = detail
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
  upsertUnreadChannel(state: S, message: Message) {
    const myId = state.detail?.id
    const unreadChannel: UnreadChannel = {
      channelId: message.channelId,
      count: 1,
      noticeable: false,
      since: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const { detectMentions } = useDetecter(message.content)
    unreadChannel.noticeable = detectMentions.some(data => data.id === myId)
    if (
      message.channelId in state.subscriptionMap ||
      unreadChannel.noticeable
    ) {
      if (message.channelId in state.unreadChannelsSet) {
        const preUnreadChannel = state.unreadChannelsSet[message.channelId]
        unreadChannel.count = preUnreadChannel.count + 1
        unreadChannel.since = preUnreadChannel.since
        Vue.delete(state.unreadChannelsSet, unreadChannel.channelId)
        Vue.set(state.unreadChannelsSet, unreadChannel.channelId, unreadChannel)
      }
      Vue.set(state.unreadChannelsSet, unreadChannel.channelId, unreadChannel)
    }
  },
  deleteUnreadChannel(state: S, channelId: ChannelId) {
    Vue.delete(state.unreadChannelsSet, channelId)
  },

  setStaredChannels(state: S, channelIds: ChannelId[]) {
    state.staredChannelSet = Object.fromEntries(
      channelIds.map(id => [id, true])
    )
  },
  addStaredChannel(state: S, channelId: ChannelId) {
    Vue.set(state.staredChannelSet, channelId, true)
  },
  deleteStaredChannel(state: S, channelId: ChannelId) {
    Vue.delete(state.staredChannelSet, channelId)
  },

  upsertLocalStampHistory(
    state: S,
    { stampId, datetime }: { stampId: StampId; datetime: Date }
  ) {
    Vue.set(state.stampHistory, stampId, datetime)
  },

  setSubscriptionMap(
    state: S,
    subscriptionMap: Record<ChannelId, ChannelSubscribeLevel>
  ) {
    state.subscriptionMap = subscriptionMap
  },
  setSubscription(
    state: S,
    payload: {
      channelId: ChannelId
      subscriptionLevel: ChannelSubscribeLevel
    }
  ) {
    Vue.set(state.subscriptionMap, payload.channelId, payload.subscriptionLevel)
  }
})
