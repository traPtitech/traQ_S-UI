import { defineStore, acceptHMRUpdate } from 'pinia'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId, DMChannelId } from '/@/types/entity-ids'
import type { UnreadChannel, Message } from '@traptitech/traq'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { computed, ref } from 'vue'
import { checkBadgeAPISupport } from '/@/lib/dom/browser'
import { removeNotification } from '/@/lib/notification/notification'
import { messageMitt } from '/@/store/entities/messages'
import { detectMentionOfMe } from '/@/lib/markdown/detector'
import { wsListener } from '/@/lib/websocket'
import apis from '/@/lib/apis'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { useChannelsStore } from '/@/store/entities/channels'
import { useViewStatesStore } from './viewStates'
import { useMeStore } from './me'

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

const useSubscriptionStorePinia = defineStore('domain/subscription', () => {
  const channelsStore = useChannelsStore()
  const meStore = useMeStore()
  const viewStatesStore = useViewStatesStore()

  const unreadChannelsMap = ref(
    new Map<ChannelId | DMChannelId, UnreadChannel>()
  )
  const unreadChannelsMapFetched = ref(false)
  const unreadChannelsMapInitialFetchPromise = ref(
    useTrueChangedPromise(unreadChannelsMapFetched)
  )
  const setUnreadChannelsMap = (
    newUnreadChannelsMap: Map<ChannelId, UnreadChannel>
  ) => {
    unreadChannelsMap.value = newUnreadChannelsMap
    unreadChannelsMapFetched.value = true
    updateBadge(unreadChannelsMap.value)
  }
  const upsertUnreadChannel = (
    message: Readonly<Message>,
    noticeable: boolean
  ) => {
    if (unreadChannelsMap.value.has(message.channelId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const oldUnreadChannel = unreadChannelsMap.value.get(message.channelId)!
      unreadChannelsMap.value.set(message.channelId, {
        ...oldUnreadChannel,
        count: oldUnreadChannel.count + 1,
        noticeable: oldUnreadChannel.noticeable || noticeable,
        updatedAt: message.createdAt
      })
    } else {
      unreadChannelsMap.value.set(message.channelId, {
        channelId: message.channelId,
        count: 1,
        noticeable,
        since: message.createdAt,
        updatedAt: message.createdAt,
        oldestMessageId: message.id
      })
    }
    updateBadge(unreadChannelsMap.value)
  }
  /**
   * 既読になったイベントを受け取ったときに利用
   */
  const deleteUnreadChannel = (channelId: ChannelId) => {
    unreadChannelsMap.value.delete(channelId)
    updateBadge(unreadChannelsMap.value)
    removeNotification(channelId)
  }
  /**
   * 既読にするときに利用
   */
  const deleteUnreadChannelWithSend = async (channelId: ChannelId) => {
    // 未読を取得していないと未読を表示できないため (また既読にできないため)
    await unreadChannelsMapInitialFetchPromise.value

    const isUnreadChannel = unreadChannelsMap.value.has(channelId)
    if (isUnreadChannel) {
      // チャンネルを既読にする
      // (サーバーから削除すればwsから変更を受け取ることでローカルも変更される)
      apis.readChannel(channelId)
      // ただし他端末で閲覧中の場合は未読に追加されないので
      // 既読イベントが送信されてこないのでローカルでも既読にする
      deleteUnreadChannel(channelId)
    }
  }
  const fetchUnreadChannels = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && unreadChannelsMapFetched.value) return

    const { data } = await apis.getMyUnreadChannels()
    setUnreadChannelsMap(
      new Map(
        data.map(unreadChannel => [unreadChannel.channelId, unreadChannel])
      )
    )
  }

  const subscriptionMap = ref(new Map<ChannelId, ChannelSubscribeLevel>())
  const subscriptionMapFetched = ref(false)
  const subscribedChannels = computed(
    () =>
      new Set(
        [...subscriptionMap.value.entries()]
          .filter(
            ([id, level]) =>
              channelsStore.channelsMap.value.has(id) &&
              level !== ChannelSubscribeLevel.none
          )
          .map(([id]) => id)
      )
  )
  const isChannelSubscribed = (channelId: ChannelId) =>
    (subscriptionMap.value.get(channelId) ?? ChannelSubscribeLevel.none) !==
    ChannelSubscribeLevel.none
  const fetchSubscriptions = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && subscriptionMapFetched.value) return

    const res = await apis.getMyChannelSubscriptions()
    subscriptionMap.value = new Map(res.data.map(s => [s.channelId, s.level]))
    subscriptionMapFetched.value = true
  }
  const changeSubscriptionLevel = async (
    channelId: ChannelId,
    subscriptionLevel: ChannelSubscribeLevel
  ) => {
    await apis.setChannelSubscribeLevel(channelId, {
      level: subscriptionLevel
    })
    subscriptionMap.value.set(channelId, subscriptionLevel)
  }

  wsListener.on('MESSAGE_READ', ({ id }) => {
    deleteUnreadChannel(id)
  })
  wsListener.on('reconnect', () => {
    fetchUnreadChannels({ ignoreCache: true })
    fetchSubscriptions({ ignoreCache: true })
  })
  wsListener.on('CHANNEL_SUBSCRIBERS_CHANGED', () => {
    fetchSubscriptions({ ignoreCache: true })
  })

  messageMitt.on('addMessage', async ({ message, isCiting }) => {
    // 他端末の閲覧状態の取得が完了するのを待つ
    await viewStatesStore.viewStatesInitialFetchPromise.value

    // 閲覧中のチャンネルは未読に追加しない
    if (viewStatesStore.monitoringChannels.value.has(message.channelId)) return
    // 自分の投稿は未読に追加しない
    if (meStore.myId.value === message.userId) return

    const noticeable =
      isCiting ||
      detectMentionOfMe(
        message.content,
        meStore.myId.value ?? '',
        meStore.detail.value?.groups ?? []
      ) ||
      !!channelsStore.channelsMap.value.get(message.channelId)?.force
    const isDM = channelsStore.dmChannelsMap.value.has(message.channelId)
    if (!noticeable && !isDM && !isChannelSubscribed(message.channelId)) return

    upsertUnreadChannel(message, noticeable)
  })

  return {
    unreadChannelsMap,
    unreadChannelsMapInitialFetchPromise,
    subscriptionMap,
    subscribedChannels,
    deleteUnreadChannelWithSend,
    fetchUnreadChannels,
    isChannelSubscribed,
    fetchSubscriptions,
    changeSubscriptionLevel
  }
})

export const useSubscriptionStore = convertToRefsStore(
  useSubscriptionStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useSubscriptionStorePinia, import.meta.hot)
  )
}
