import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import apis from '@/lib/apis'
import { me } from './index'
import { ChannelId } from '@/types/entity-ids'
import { ChannelSubscribeLevel, Message } from '@traptitech/traq'
import { ActionContext } from 'vuex'
import _store from '@/_store'

export const meActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, me)

export const actions = defineActions({
  async fetchStampHistory(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyStampHistory()
    commit.setStampHistory(
      new Map(data.map(h => [h.stampId, new Date(h.datetime)]))
    )
  },

  // TODO: 整理する
  async fetchUnreadChannels(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyUnreadChannels()
    commit.setUnreadChannelsMap(
      new Map(
        data.map(unreadChannel => [unreadChannel.channelId, unreadChannel])
      )
    )
  },
  /** チャンネルを既読にする */
  readChannel(context, payload: { channelId: ChannelId }) {
    const { commit } = meActionContext(context)
    commit.deleteUnreadChannel(payload.channelId)
    apis.readChannel(payload.channelId)
  },
  onChannelRead(context, channelId: ChannelId) {
    const { commit } = meActionContext(context)
    commit.deleteUnreadChannel(channelId)
  },
  onMessageCreated(context, message: Message) {
    const { rootState, commit } = meActionContext(context)
    // 見ているチャンネルは未読に追加しない
    if (rootState.domain.messagesView.currentChannelId === message.channelId)
      return
    // 自分の投稿は未読に追加しない
    if (_store.state.domain.me.detail?.id === message.userId) return

    commit.upsertUnreadChannel(message)
  },

  async fetchStaredChannels(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyStars()
    commit.setStaredChannels(new Set(data))
  },
  onAddStaredChannel(context, channelId: ChannelId) {
    const { commit } = meActionContext(context)
    commit.addStaredChannel(channelId)
  },
  onDeleteStaredChannel(context, channelId: ChannelId) {
    const { commit } = meActionContext(context)
    commit.deleteStaredChannel(channelId)
  },

  async fetchSubscriptions(context) {
    const { rootDispatch, commit } = meActionContext(context)
    const res = await apis.getMyChannelSubscriptions()
    commit.setSubscriptionMap(
      new Map(res.data.map(s => [s.channelId, s.level]))
    )
    rootDispatch.domain.channelTree.constructHomeChannelTree()
  },
  async changeSubscriptionLevel(
    context,
    payload: { channelId: ChannelId; subscriptionLevel: ChannelSubscribeLevel }
  ) {
    const { commit, rootDispatch } = meActionContext(context)
    apis.setChannelSubscribeLevel(payload.channelId, {
      level: payload.subscriptionLevel
    })
    commit.setSubscription(payload)
    rootDispatch.domain.channelTree.constructHomeChannelTree()
  }
})
