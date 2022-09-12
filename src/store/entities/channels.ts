import type { Channel, DMChannel } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId, DMChannelId, UserId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/basic/async'
import apis from '/@/lib/apis'
import { arrayToMap } from '/@/lib/basic/map'
import { entityMitt } from './mitt'
import { channelIdToPathString } from '/@/lib/channel'
import { wsListener } from '/@/lib/websocket'

const getChannel = createSingleflight(apis.getChannel.bind(apis))
const getChannels = createSingleflight(apis.getChannels.bind(apis))
const getUserDMChannel = createSingleflight(apis.getUserDMChannel.bind(apis))

const useChannelsStorePinia = defineStore('entities/channels', () => {
  const channelsMap = ref(new Map<ChannelId, Channel>())
  const dmChannelsMap = ref(new Map<DMChannelId, DMChannel>())
  const bothChannelsMapFetched = ref(false)
  const bothChannelsMapInitialFetchPromise = ref(
    useTrueChangedPromise(bothChannelsMapFetched)
  )

  const userIdToDmChannelIdMap = computed(
    () => new Map([...dmChannelsMap.value.values()].map(c => [c.userId, c.id]))
  )

  const setChannel = (channel: Channel) => {
    channelsMap.value.set(channel.id, channel)
  }
  const deleteChannel = (channelId: ChannelId) => {
    channelsMap.value.delete(channelId)
    dmChannelsMap.value.delete(channelId)
  }

  const fetchUserDMChannel = async (userId: UserId) => {
    const [{ data: dmChannel }, shared] = await getUserDMChannel(userId)
    if (!shared) {
      dmChannelsMap.value.set(dmChannel.id, dmChannel)
    }
    return dmChannel.id
  }

  const fetchChannels = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && bothChannelsMapFetched.value) {
      return [channelsMap.value, dmChannelsMap.value]
    }

    const [{ data: channels }, shared] = await getChannels(true)
    const newChannelsMap = arrayToMap(channels.public, 'id')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- includeDM=trueなので
    const newDmChannelsMap = arrayToMap(channels.dm!, 'id')
    if (!shared) {
      channelsMap.value = newChannelsMap
      dmChannelsMap.value = newDmChannelsMap
      bothChannelsMapFetched.value = true
      entityMitt.emit('setChannels')
    }
    return [channelsMap, dmChannelsMap]
  }

  const addChannel = async ({
    channelId,
    dmUserId
  }: {
    channelId: ChannelId | DMChannelId
    dmUserId?: UserId
  }) => {
    if (
      channelsMap.value.has(channelId) ||
      dmChannelsMap.value.has(channelId)
    ) {
      return
    }

    // DMのとき
    if (dmUserId) {
      dmChannelsMap.value.set(channelId, { id: channelId, userId: dmUserId })
      return
    }

    const [{ data: channel }, shared] = await getChannel(channelId)
    if (shared) return

    // ルート直下でないチャンネル
    if (channel.parentId) {
      // 親チャンネルの`children`が不整合になるので再取得
      const { data: parentChannel } = await apis.getChannel(channel.parentId)
      // 注:下のsetChannelとの間にawaitがないようにする
      setChannel(parentChannel)
    }

    setChannel(channel)

    entityMitt.emit('addChannel', channel)
  }
  const updateChannel = async ({
    channelId,
    dmUserId
  }: {
    channelId: ChannelId | DMChannelId
    dmUserId?: UserId
  }) => {
    const old = channelsMap.value.get(channelId)
    // 元々存在していなかったものが来たら追加として処理する
    if (!old) {
      await addChannel({ channelId, dmUserId })
      return
    }

    // DMのときは変化しないはずなので処理しない
    if (dmUserId) return

    const oldPath = channelIdToPathString(channelId, channelsMap.value)

    const [{ data: channel }, shared] = await getChannel(channelId)
    if (shared) return

    // 親チャンネルが変わったときは`children`が不整合にならないように親チャンネルの情報を更新する
    if (old.parentId !== channel.parentId) {
      const oldParentRes = old.parentId
        ? await getChannel(old.parentId)
        : undefined
      const newParentRes = channel.parentId
        ? await getChannel(channel.parentId)
        : undefined

      // 注:下のsetChannelとの間にawaitがないようにする
      if (oldParentRes) {
        setChannel(oldParentRes[0].data)
      }
      if (newParentRes) {
        setChannel(newParentRes[0].data)
      }
    }

    setChannel(channel)

    entityMitt.emit('updateChannel', {
      oldChannel: old,
      newChannel: channel,
      oldPath
    })
  }

  wsListener.on('CHANNEL_CREATED', ({ id, dm_user_id }) => {
    addChannel({ channelId: id, dmUserId: dm_user_id })
  })
  wsListener.on('CHANNEL_UPDATED', ({ id, dm_user_id }) => {
    updateChannel({ channelId: id, dmUserId: dm_user_id })
  })
  wsListener.on('CHANNEL_DELETED', ({ id }) => {
    deleteChannel(id)
  })
  wsListener.on('reconnect', () => {
    fetchChannels({ ignoreCache: true })
  })

  return {
    channelsMap,
    dmChannelsMap,
    userIdToDmChannelIdMap,
    bothChannelsMapInitialFetchPromise,
    addChannel,
    fetchUserDMChannel,
    fetchChannels
  }
})

export const useChannelsStore = convertToRefsStore(useChannelsStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useChannelsStorePinia, import.meta.hot)
  )
}
