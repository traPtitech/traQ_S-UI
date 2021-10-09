import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId, StampId } from '/@/types/entity-ids'
import {
  UnreadChannel,
  ChannelSubscribeLevel,
  Message,
  MyUserDetail,
  MyChannelViewState
} from '@traptitech/traq'
import { checkBadgeAPISupport } from '/@/lib/dom/browser'
import { removeNotification } from '/@/lib/notification/notification'

const isBadgingAPISupported = checkBadgeAPISupport()
const updateBadge = async (
  unreadChannelsMap: Map<ChannelId, UnreadChannel>
) => {
  if (!isBadgingAPISupported) return

  const unreadCount = [...unreadChannelsMap.values()].reduce(
    (acc, current) => acc + current.count,
    0
  )
  if (unreadCount > 0) {
    await navigator.setAppBadge(unreadCount)
  } else {
    await navigator.clearAppBadge()
  }
}

export const mutations = defineMutations<S>()({
  setDetail(state, detail: Readonly<MyUserDetail>) {
    state.detail = detail
  },
  unsetDetail(state) {
    state.detail = undefined
  },

  setStampHistory(state: S, stampHistory: Map<StampId, Date>) {
    state.stampHistory = stampHistory
    state.stampHistoryFetched = true
  },
  upsertLocalStampHistory(
    state: S,
    { stampId, datetime }: { stampId: StampId; datetime: Date }
  ) {
    state.stampHistory.set(stampId, datetime)
  },

  setUnreadChannelsMap(
    state: S,
    unreadChannelsMap: Map<ChannelId, UnreadChannel>
  ) {
    state.unreadChannelsMap = unreadChannelsMap
    state.unreadChannelsMapFetched = true
    updateBadge(state.unreadChannelsMap)
  },
  upsertUnreadChannel(
    state: S,
    { message, noticeable }: { message: Readonly<Message>; noticeable: boolean }
  ) {
    if (state.unreadChannelsMap.has(message.channelId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const oldUnreadChannel = state.unreadChannelsMap.get(message.channelId)!
      state.unreadChannelsMap.set(message.channelId, {
        ...oldUnreadChannel,
        count: oldUnreadChannel.count + 1,
        noticeable: oldUnreadChannel.noticeable || noticeable,
        updatedAt: message.createdAt
      })
    } else {
      state.unreadChannelsMap.set(message.channelId, {
        channelId: message.channelId,
        count: 1,
        noticeable,
        since: message.createdAt,
        updatedAt: message.createdAt
      })
    }
    updateBadge(state.unreadChannelsMap)
  },
  deleteUnreadChannel(state: S, channelId: ChannelId) {
    state.unreadChannelsMap.delete(channelId)
    updateBadge(state.unreadChannelsMap)
    removeNotification(channelId)
  },

  setStaredChannels(state: S, channelIds: Set<ChannelId>) {
    state.staredChannelSet = channelIds
    state.staredChannelSetFetched = true
  },
  addStaredChannel(state: S, channelId: ChannelId) {
    state.staredChannelSet.add(channelId)
  },
  deleteStaredChannel(state: S, channelId: ChannelId) {
    state.staredChannelSet.delete(channelId)
  },

  setSubscriptionMap(
    state: S,
    subscriptionMap: Map<ChannelId, ChannelSubscribeLevel>
  ) {
    state.subscriptionMap = subscriptionMap
    state.subscriptionMapFetched = true
  },
  setSubscription(
    state: S,
    payload: {
      channelId: ChannelId
      subscriptionLevel: ChannelSubscribeLevel
    }
  ) {
    state.subscriptionMap.set(payload.channelId, payload.subscriptionLevel)
  },

  setViewStates(state: S, viewStates: Map<string, MyChannelViewState>) {
    state.viewStates = viewStates
    state.viewStatesFetched = true
  },
  setViewState(state: S, viewState: MyChannelViewState) {
    state.viewStates.set(viewState.key, viewState)
  },
  deleteViewState(state: S, key: string) {
    state.viewStates.delete(key)
  }
})
