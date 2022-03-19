import { ChannelId, DMChannelId, UserId } from '/@/types/entity-ids'
import {
  UnreadChannel,
  ChannelSubscribeLevel,
  MyUserDetail,
  MyChannelViewState,
  Message,
  ChannelViewState
} from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref, toRefs } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { checkBadgeAPISupport } from '/@/lib/dom/browser'
import {
  deleteToken,
  removeNotification
} from '/@/lib/notification/notification'
import { messageMitt } from '/@/store/entities/messages'
import { detectMentionOfMe } from '/@/lib/markdown/detector'
import { wsListener } from '/@/lib/websocket'
import apis from '/@/lib/apis'
import mitt from 'mitt'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { useChannelsStore } from '/@/store/entities/channels'

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

type MeEventMap = {
  setSubscriptions: void
  updateSubscriptions: void
}

export const meMitt = mitt<MeEventMap>()

export type IDBState = {
  detail: Readonly<MyUserDetail> | undefined
}

const useMeStorePinia = defineStore('domain/me', () => {
  const channelsStore = useChannelsStore()

  const initialValue: IDBState = {
    detail: undefined
  }

  // TODO: ログインチェック時にrestoreを待つ必要があるかもしれない
  const [state, restoring, restoringPromise] = useIndexedDbValue(
    'store/domain/me',
    1,
    {},
    initialValue
  )

  const myId = computed(() => state.detail?.id)

  const fetchMe = async () => {
    try {
      const { data } = await apis.getMe()
      state.detail = data
      return data
    } catch {
      state.detail = undefined
      return undefined
    }
  }
  const logout = async ({
    allSession = false
  }: { allSession?: boolean } = {}) => {
    state.detail = undefined
    await apis.logout(undefined, allSession)
    deleteToken()
  }

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
        updatedAt: message.createdAt
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

  const staredChannelSet = ref(new Set<ChannelId>())
  const staredChannelSetFetched = ref(false)
  const fetchStaredChannels = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && staredChannelSetFetched.value) return

    const { data } = await apis.getMyStars()
    staredChannelSet.value = new Set(data)
    staredChannelSetFetched.value = true
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

    meMitt.emit('setSubscriptions')
  }
  const changeSubscriptionLevel = async (
    channelId: ChannelId,
    subscriptionLevel: ChannelSubscribeLevel
  ) => {
    await apis.setChannelSubscribeLevel(channelId, {
      level: subscriptionLevel
    })
    subscriptionMap.value.set(channelId, subscriptionLevel)

    meMitt.emit('updateSubscriptions')
  }

  const viewStates = ref(new Map<string, MyChannelViewState>())
  const viewStatesFetched = ref(false)
  const viewStatesInitialFetchPromise = useTrueChangedPromise(viewStatesFetched)
  const monitoringChannels = computed(
    () =>
      new Set(
        [...viewStates.value.values()]
          .filter(
            vs =>
              vs.state === ChannelViewState.Monitoring ||
              vs.state === ChannelViewState.Editing
          )
          .map(vs => vs.channelId)
      )
  )
  const fetchViewStates = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && viewStatesFetched.value) return

    const res = await apis.getMyViewStates()
    viewStates.value = new Map(res.data.map(v => [v.key, v]))
    viewStatesFetched.value = true
  }

  const onUserUpdated = (userId: UserId) => {
    if (myId.value !== userId) return
    fetchMe()
  }
  wsListener.on('USER_UPDATED', ({ id }) => {
    onUserUpdated(id)
  })
  wsListener.on('USER_ICON_UPDATED', ({ id }) => {
    onUserUpdated(id)
  })
  wsListener.on('MESSAGE_READ', ({ id }) => {
    deleteUnreadChannel(id)
  })
  wsListener.on('CHANNEL_STARED', ({ id }) => {
    staredChannelSet.value.add(id)
  })
  wsListener.on('CHANNEL_UNSTARED', ({ id }) => {
    staredChannelSet.value.delete(id)
  })
  wsListener.on('CHANNEL_DELETED', ({ id }) => {
    staredChannelSet.value.delete(id)
  })
  wsListener.on('USER_VIEWSTATE_CHANGED', ({ view_states: newViewStates }) => {
    viewStates.value = new Map(newViewStates.map(v => [v.key, v]))
  })
  wsListener.on('reconnect', () => {
    fetchMe()
    fetchUnreadChannels({ ignoreCache: true })
    fetchStaredChannels({ ignoreCache: true })
    fetchSubscriptions({ ignoreCache: true })
    fetchViewStates({ ignoreCache: true })
  })

  messageMitt.on('addMessage', async ({ message, isCiting }) => {
    // 他端末の閲覧状態の取得が完了するのを待つ
    await viewStatesInitialFetchPromise

    // 閲覧中のチャンネルは未読に追加しない
    if (monitoringChannels.value.has(message.channelId)) return
    // 自分の投稿は未読に追加しない
    if (myId.value === message.userId) return

    const noticeable =
      isCiting ||
      detectMentionOfMe(
        message.content,
        myId.value ?? '',
        state.detail?.groups ?? []
      ) ||
      !!channelsStore.channelsMap.value.get(message.channelId)?.force
    const isDM = channelsStore.dmChannelsMap.value.has(message.channelId)
    if (!noticeable && !isDM && !isChannelSubscribed(message.channelId)) return

    upsertUnreadChannel(message, noticeable)
  })

  return {
    ...toRefs(state),
    myId,
    unreadChannelsMap,
    unreadChannelsMapInitialFetchPromise,
    staredChannelSet,
    subscriptionMap,
    subscribedChannels,
    monitoringChannels,
    fetchMe,
    logout,
    deleteUnreadChannelWithSend,
    fetchUnreadChannels,
    fetchStaredChannels,
    isChannelSubscribed,
    fetchSubscriptions,
    changeSubscriptionLevel,
    fetchViewStates
  }
})

export const useMeStore = convertToRefsStore(useMeStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMeStorePinia, import.meta.hot))
}
