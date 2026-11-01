import useCachedChannelPath from '/@/composables/useCachedChannelPath'
import apis from '/@/lib/apis'
import { isUUID } from '/@/lib/basic/uuid'
import type { SimpleChannel } from '/@/lib/channel'
import { constructChannelPath } from '/@/router'
import { useChannelsStore } from '/@/store/entities/channels'
import type {
  ChannelId,
  DMChannelId,
  ThreadChannelId
} from '/@/types/entity-ids'

type PathChannelId = ChannelId | DMChannelId | ThreadChannelId

const useChannelPath = () => {
  const cached = useCachedChannelPath()
  const { channelsMap, dmChannelsMap, bothChannelsMapFetched } =
    useChannelsStore()

  const isCachedChannel = (id: PathChannelId) =>
    channelsMap.value.has(id) || dmChannelsMap.value.has(id)

  const fetchThreadChannel = async (id: PathChannelId) => {
    if (!bothChannelsMapFetched.value || !isUUID(id)) return null

    // スレッドは保存・キャッシュせず、変換のたびに存在と現在の名前を確認する。
    try {
      const { data: channel } = await apis.getChannel(id)
      if (
        !('parentMessageId' in channel) ||
        typeof channel.parentMessageId !== 'string' ||
        !channel.parentMessageId ||
        !channel.parentId ||
        channel.id !== id
      ) {
        return null
      }
      return { id: channel.id, name: channel.name, parentId: channel.parentId }
    } catch {
      return null
    }
  }

  const channelIdToSimpleChannelPath = async (
    id: PathChannelId
  ): Promise<SimpleChannel[] | null> => {
    if (isCachedChannel(id)) return cached.channelIdToSimpleChannelPath(id)
    const thread = await fetchThreadChannel(id)
    if (!thread) return null
    try {
      const parentPath = cached.channelIdToSimpleChannelPath(thread.parentId)
      if (!parentPath?.length) return null
      return [...parentPath, { id: thread.id, name: thread.name }]
    } catch {
      return null
    }
  }

  const channelIdToPath = async (id: PathChannelId) =>
    (await channelIdToSimpleChannelPath(id))?.map(channel => channel.name) ??
    null

  const channelIdToPathString = async (id: PathChannelId, hashed = false) => {
    if (isCachedChannel(id)) return cached.channelIdToPathString(id, hashed)
    const path = await channelIdToPath(id)
    return path ? (hashed ? '#' : '') + path.join('/') : null
  }

  const channelIdToShortPathString = async (
    id: PathChannelId,
    hashed = false
  ) => {
    if (isCachedChannel(id))
      return cached.channelIdToShortPathString(id, hashed)
    const thread = await fetchThreadChannel(id)
    if (!thread) return null
    try {
      const parentPath = cached.channelIdToShortPathString(
        thread.parentId,
        hashed
      )
      return parentPath ? `${parentPath}/${thread.name}` : null
    } catch {
      return null
    }
  }

  const channelIdToLink = async (id: PathChannelId) => {
    if (isCachedChannel(id)) return cached.channelIdToLink(id)
    const path = await channelIdToSimpleChannelPath(id)
    if (!path) return null
    // 表示にはスレッド名、URLの末尾にはUUIDを使う。
    return constructChannelPath(
      [...path.slice(0, -1).map(c => c.name), id].join('/')
    )
  }

  return {
    channelPathToId: cached.channelPathToId,
    channelPathStringToId: cached.channelPathStringToId,
    channelIdToSimpleChannelPath,
    channelIdToPath,
    channelIdToPathString,
    channelIdToShortPathString,
    channelIdToLink
  }
}

export default useChannelPath
