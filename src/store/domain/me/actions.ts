import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import api, { ChannelSubscribeLevel } from '@/lib/api'
import { me, SubscriptionLevel } from './index'
import { ChannelId } from '@/types/entity-ids'

const subscriptionLevelToApiSubscribeLevel = (
  level: SubscriptionLevel
): ChannelSubscribeLevel =>
  level === 'notified'
    ? ChannelSubscribeLevel.NUMBER_2
    : level === 'subscribed'
    ? ChannelSubscribeLevel.NUMBER_1
    : ChannelSubscribeLevel.NUMBER_0

const apiSubscribeLevelToSubscribeLevel = (
  level: ChannelSubscribeLevel
): SubscriptionLevel =>
  level === ChannelSubscribeLevel.NUMBER_2
    ? 'notified'
    : level === ChannelSubscribeLevel.NUMBER_1
    ? 'subscribed'
    : 'none'

export const meActionContext = (context: any) =>
  moduleActionContext(context, me)

export const actions = defineActions({
  async fetchUnreadChannels(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMyUnreadChannels()
    commit.setUnreadChannelsSet(res.data)
  },

  /** チャンネルを既読にする */
  readChannel(context, payload: { channelId: ChannelId }) {
    const { commit } = meActionContext(context)
    commit.deleteUnreadChannel(payload.channelId)
    api.readChannel(payload.channelId)
  },

  async fetchStaredChannels(context) {
    const { commit } = meActionContext(context)
    const result = await api.getMyStars()
    commit.setStaredChannels(result.data)
  },
  async starChannel(context, id: ChannelId) {
    await api.addMyStar({
      channelId: id
    })
  },
  async unstarChannel(context, id: ChannelId) {
    await api.removeMyStar(id)
  },
  async fetchStampHistory(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMyStampHistory()
    const history = Object.fromEntries(
      res.data.map(h => [h.stampId, new Date(h.datetime)])
    )
    commit.setStampHistory(history)
  },
  async fetchMe(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMe()
    commit.setDetail(res.data)
  },

  async fetchSubscriptions(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMyChannelSubscriptions()
    const subscriptions: Record<
      ChannelId,
      SubscriptionLevel
    > = Object.fromEntries(
      res.data.map(s => {
        const id = s.channelId
        const level = apiSubscribeLevelToSubscribeLevel(s.level)
        return [id, level]
      })
    )
    commit.setSubscriptionMap(subscriptions)
  },
  async changeSubscriptionLevel(
    context,
    payload: { channelId: ChannelId; subscriptionLevel: SubscriptionLevel }
  ) {
    const { commit } = meActionContext(context)
    const level = subscriptionLevelToApiSubscribeLevel(
      payload.subscriptionLevel
    )
    api.setChannelSubscribeLevel(payload.channelId, { level })
    commit.setSubscription(payload)
  }
})
