import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '@/store'
import apis from '@/lib/apis'
import { me } from './index'
import { ChannelId } from '@/types/entity-ids'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { ActionContext } from 'vuex'

export const meActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, me)

export const actions = defineActions({
  async fetchMe(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMe()
    commit.setDetail(data)
  },
  async fetchUnreadChannels(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyUnreadChannels()
    commit.setUnreadChannelsSet(data)
  },

  /** チャンネルを既読にする */
  readChannel(context, payload: { channelId: ChannelId }) {
    const { commit } = meActionContext(context)
    commit.deleteUnreadChannel(payload.channelId)
    apis.readChannel(payload.channelId)
  },

  async fetchStaredChannels(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyStars()
    commit.setStaredChannels(data)
  },
  async starChannel(context, id: ChannelId) {
    await apis.addMyStar({
      channelId: id
    })
  },
  async unstarChannel(context, id: ChannelId) {
    await apis.removeMyStar(id)
  },
  async fetchStampHistory(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyStampHistory()
    const history = Object.fromEntries(
      data.map(h => [h.stampId, new Date(h.datetime)])
    )
    commit.setStampHistory(history)
  },
  async fetchSubscriptions(context) {
    const { commit } = meActionContext(context)
    const res = await apis.getMyChannelSubscriptions()
    const subscriptions: Record<
      ChannelId,
      ChannelSubscribeLevel
    > = Object.fromEntries(res.data.map(s => [s.channelId, s.level]))
    commit.setSubscriptionMap(subscriptions)
    store.dispatch.domain.channelTree.constructHomeChannelTree()
  },
  async changeSubscriptionLevel(
    context,
    payload: { channelId: ChannelId; subscriptionLevel: ChannelSubscribeLevel }
  ) {
    const { commit } = meActionContext(context)
    apis.setChannelSubscribeLevel(payload.channelId, {
      level: payload.subscriptionLevel
    })
    commit.setSubscription(payload)
    store.dispatch.domain.channelTree.constructHomeChannelTree()
  }
})
