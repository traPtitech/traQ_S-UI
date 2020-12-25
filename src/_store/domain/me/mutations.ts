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

  const unreadChannelsMap = _store.state.domain.me.unreadChannelsMap

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
  setDetail(state: S, detail: Readonly<MyUserDetail>) {
    state.detail = detail
  },
  setStampHistory(state: S, stampHistory: Map<StampId, Date>) {
    state.stampHistory = stampHistory
  },

  setUnreadChannelsMap(
    state: S,
    unreadChannelsMap: Map<ChannelId, UnreadChannel>
  ) {
    state.unreadChannelsMap = unreadChannelsMap
    updateBadge()
  },
  upsertUnreadChannel(state: S, message: Readonly<Message>) {
    const noticeable =
      detectMentionOfMe(
        message.content,
        state.detail?.id ?? '',
        state.detail?.groups ?? []
      ) || !!store.state.entities.channelsMap.get(message.channelId)?.force

    const subscriptionLevel =
      state.subscriptionMap.get(message.channelId) ?? ChannelSubscribeLevel.none

    if (
      !(
        subscriptionLevel !== ChannelSubscribeLevel.none ||
        store.state.entities.dmChannelsMap.has(message.channelId) ||
        noticeable
      )
    )
      return

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
    updateBadge()
  },
  // TODO: https://github.com/traPtitech/traQ_S-UI/issues/636
  deleteUnreadChannel(state: S, channelId: ChannelId) {
    state.unreadChannelsMap.delete(channelId)
    updateBadge()
    removeNotification(channelId)
  },

  setStaredChannels(state: S, channelIds: Set<ChannelId>) {
    state.staredChannelSet = channelIds
  },
  addStaredChannel(state: S, channelId: ChannelId) {
    state.staredChannelSet.add(channelId)
  },
  deleteStaredChannel(state: S, channelId: ChannelId) {
    state.staredChannelSet.delete(channelId)
  },

  upsertLocalStampHistory(
    state: S,
    { stampId, datetime }: { stampId: StampId; datetime: Date }
  ) {
    state.stampHistory.set(stampId, datetime)
  },

  setSubscriptionMap(
    state: S,
    subscriptionMap: Map<ChannelId, ChannelSubscribeLevel>
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
    state.subscriptionMap.set(payload.channelId, payload.subscriptionLevel)
  }
})
