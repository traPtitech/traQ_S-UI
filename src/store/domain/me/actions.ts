import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import apis from '@/lib/apis'
import { me, meMitt } from './index'
import { ChannelId, UserId } from '@/types/entity-ids'
import {
  ChannelSubscribeLevel,
  Message,
  MyChannelViewState
} from '@traptitech/traq'
import { ActionContext } from 'vuex'
import { detectMentionOfMe } from '@/lib/markdown/detector'
import { deleteToken } from '@/lib/notification/notification'
import { viewStatesInitialFetchPromise } from './promises'

export const meActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, me)

export const actions = defineActions({
  async fetchMe(context) {
    const { commit } = meActionContext(context)
    try {
      const { data } = await apis.getMe()
      commit.setDetail(data)
      return data
    } catch {
      commit.unsetDetail()
      return undefined
    }
  },
  async logout(context, { allSession = false }: { allSession?: boolean } = {}) {
    const { commit } = meActionContext(context)
    commit.unsetDetail()
    await apis.logout(undefined, allSession)
    await deleteToken()
  },
  onUserUpdated(context, userId: UserId) {
    const { getters, dispatch } = meActionContext(context)
    if (getters.myId !== userId) return

    dispatch.fetchMe()
  },

  async fetchStampHistory(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ) {
    const { state, commit } = meActionContext(context)
    if (!ignoreCache && state.stampHistoryFetched) return

    const { data } = await apis.getMyStampHistory()
    commit.setStampHistory(
      new Map(data.map(h => [h.stampId, new Date(h.datetime)]))
    )
  },

  async fetchUnreadChannels(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ) {
    const { state, commit } = meActionContext(context)
    if (!ignoreCache && state.unreadChannelsMapFetched) return

    const { data } = await apis.getMyUnreadChannels()
    commit.setUnreadChannelsMap(
      new Map(
        data.map(unreadChannel => [unreadChannel.channelId, unreadChannel])
      )
    )
  },
  deleteUnreadChannel(context, channelId: ChannelId) {
    const { commit } = meActionContext(context)
    commit.deleteUnreadChannel(channelId)
  },
  async onMessageCreated(
    context,
    { message, isCiting }: { message: Message; isCiting: boolean }
  ) {
    const { rootState, getters, commit, rootGetters } = meActionContext(context)

    // 他端末の閲覧状態の取得が完了するのを待つ
    await viewStatesInitialFetchPromise

    // 閲覧中のチャンネルは未読に追加しない
    if (getters.monitoringChannels.has(message.channelId)) return
    // 自分の投稿は未読に追加しない
    if (rootGetters.domain.me.myId === message.userId) return

    const noticeable =
      isCiting ||
      detectMentionOfMe(
        message.content,
        rootGetters.domain.me.myId ?? '',
        rootState.domain.me.detail?.groups ?? []
      ) ||
      !!rootState.entities.channelsMap.get(message.channelId)?.force
    const isDM = rootState.entities.dmChannelsMap.has(message.channelId)
    const isChannelSubscribed = getters.isChannelSubscribed(message.channelId)
    if (!noticeable && !isDM && !isChannelSubscribed) return

    commit.upsertUnreadChannel({ message, noticeable })
  },

  async fetchStaredChannels(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ) {
    const { state, commit } = meActionContext(context)
    if (!ignoreCache && state.staredChannelSetFetched) return

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

  async fetchSubscriptions(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ) {
    const { state, commit } = meActionContext(context)
    if (!ignoreCache && state.subscriptionMapFetched) return

    const res = await apis.getMyChannelSubscriptions()
    commit.setSubscriptionMap(
      new Map(res.data.map(s => [s.channelId, s.level]))
    )
    meMitt.emit('setSubscriptions')
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
    meMitt.emit('updateSubscriptions')
  },

  async fetchViewStates(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ) {
    const { state, commit } = meActionContext(context)
    if (!ignoreCache && state.viewStatesFetched) return

    const res = await apis.getMyViewStates()
    commit.setViewStates(new Map(res.data.map(v => [v.key, v])))
  },
  setViewStates(context, payload: MyChannelViewState[]) {
    const { commit } = meActionContext(context)
    commit.setViewStates(new Map(payload.map(v => [v.key, v])))
  }
})
