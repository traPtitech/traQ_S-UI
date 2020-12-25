import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId, StampId } from '@/types/entity-ids'
import {
  UnreadChannel,
  MyUserDetail,
  ChannelSubscribeLevel,
  Message
} from '@traptitech/traq'
import { detectMentionOfMe } from '@/lib/detector'
import _store from '@/_store'
import { checkBadgeAPISupport } from '@/lib/util/browser'
import { removeNotification } from '@/lib/firebase'
import store from '@/store'

const isBadgingAPISupported = checkBadgeAPISupport()
const updateBadge = async () => {
  if (!isBadgingAPISupported) return

  const unreadChannelsSet = _store.state.domain.me.unreadChannelsSet

  const unreadCount = Object.entries(unreadChannelsSet).reduce(
    (acc, [, current]) => acc + current.count,
    0
  )
  if (unreadCount > 0) {
    await navigator.setAppBadge(unreadCount)
  } else {
    await navigator.clearAppBadge()
  }
}

export const mutations = defineMutations<S>()({
  setDetail(state: S, detail: Readonly<MyUserDetail>) {
    state.detail = detail
  },
  setStampHistory(state: S, stampHistory: Record<StampId, Date>) {
    state.stampHistory = stampHistory
  },

  setUnreadChannelsSet(state: S, unreadChannels: readonly UnreadChannel[]) {
    state.unreadChannelsSet = Object.fromEntries(
      unreadChannels.map(unread => [unread.channelId, unread])
    )
    updateBadge()
  },
  upsertUnreadChannel(state: S, message: Readonly<Message>) {
    const noticeable =
      detectMentionOfMe(
        message.content,
        state.detail?.id ?? '',
        state.detail?.groups ?? []
      ) || !!store.state.entities.channelsMap.get(message.channelId)?.force

    if (
      !(
        state.subscriptionMap[message.channelId] > 0 ||
        store.state.entities.dmChannelsMap.get(message.channelId) ||
        noticeable
      )
    )
      return

    if (message.channelId in state.unreadChannelsSet) {
      const oldUnreadChannel = state.unreadChannelsSet[message.channelId]
      state.unreadChannelsSet[message.channelId] = {
        ...oldUnreadChannel,
        count: oldUnreadChannel.count + 1,
        noticeable: oldUnreadChannel.noticeable || noticeable,
        updatedAt: message.createdAt
      }
    } else {
      state.unreadChannelsSet[message.channelId] = {
        channelId: message.channelId,
        count: 1,
        noticeable,
        since: message.createdAt,
        updatedAt: message.createdAt
      }
    }
    updateBadge()
  },
  // TODO: https://github.com/traPtitech/traQ_S-UI/issues/636
  deleteUnreadChannel(state: S, channelId: ChannelId) {
    delete state.unreadChannelsSet[channelId]
    updateBadge()
    removeNotification(channelId)
  },

  setStaredChannels(state: S, channelIds: readonly ChannelId[]) {
    state.staredChannelSet = Object.fromEntries(
      channelIds.map(id => [id, true])
    )
  },
  addStaredChannel(state: S, channelId: ChannelId) {
    state.staredChannelSet[channelId] = true
  },
  deleteStaredChannel(state: S, channelId: ChannelId) {
    delete state.staredChannelSet[channelId]
  },

  upsertLocalStampHistory(
    state: S,
    { stampId, datetime }: { stampId: StampId; datetime: Date }
  ) {
    state.stampHistory[stampId] = datetime
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
    state.subscriptionMap[payload.channelId] = payload.subscriptionLevel
  }
})
