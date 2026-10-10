import type { SimpleChannel } from '/@/lib/channel'
import { channelIdToSimpleChannelPath as libChannelIdToSimpleChannelPath } from '/@/lib/channel'
import { channelPathToId as channelPathToIdImpl } from '/@/lib/channelTree'
import { constructChannelPath, constructUserPath } from '/@/router'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId, DMChannelId } from '/@/types/entity-ids'

import { useUsersStore } from '../store/entities/users'

const useChannelPath = () => {
  const { channelsMap, dmChannelsMap, bothChannelsMapFetched } =
    useChannelsStore()
  const { usersMap } = useUsersStore()
  const { channelTree, channelIdToShortPath } = useChannelTree()

  const getUserNameByDMChannelId = (dmChannelId: DMChannelId) => {
    const dmChannel = dmChannelsMap.value.get(dmChannelId)
    if (!dmChannel) return null
    return usersMap.value.get(dmChannel.userId)?.name ?? ''
  }

  const channelPathToId = (path: string[]) => {
    return channelPathToIdImpl(path, channelTree.value)
  }

  const channelPathStringToId = (path: string) => {
    return channelPathToId(path.split('/'))
  }

  const channelIdToSimpleChannelPath = (
    id: ChannelId | DMChannelId
  ): SimpleChannel[] | null => {
    if (dmChannelsMap.value.has(id)) {
      return [
        {
          id,
          name: getUserNameByDMChannelId(id) as string
        }
      ]
    }

    if (channelsMap.value.has(id)) {
      return libChannelIdToSimpleChannelPath(id, channelsMap.value)
    }

    if (!bothChannelsMapFetched.value) return null
    throw new Error(`channelIdToPath: No channel: ${id}`)
  }

  const channelIdToPath = (id: ChannelId | DMChannelId) =>
    channelIdToSimpleChannelPath(id)?.map(c => c.name) ?? null

  const dmChannelIdToPathString = (id: DMChannelId, hashed = false) =>
    (hashed ? '@' : '') + (getUserNameByDMChannelId(id) ?? '')

  const channelIdToPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ) => {
    if (!bothChannelsMapFetched.value) return null
    if (dmChannelsMap.value.has(id)) return dmChannelIdToPathString(id, hashed)
    return (hashed ? '#' : '') + channelIdToPath(id)?.join('/')
  }

  const channelIdToShortPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ) => {
    if (dmChannelsMap.value.has(id)) {
      return dmChannelIdToPathString(id, hashed)
    }

    if (!channelsMap.value.has(id)) {
      if (!bothChannelsMapFetched.value) return null
      throw new Error(`channelIdToShortPathString: No channel: ${id}`)
    }

    return channelIdToShortPath.value(id, hashed)
  }

  const channelIdToLink = (id: ChannelId | DMChannelId) => {
    if (!bothChannelsMapFetched.value) return null

    const pathString = channelIdToPathString(id, false) as string
    if (dmChannelsMap.value.has(id)) {
      return constructUserPath(pathString)
    }
    return constructChannelPath(pathString)
  }

  return {
    channelPathToId,
    channelPathStringToId,
    channelIdToPath,
    channelIdToSimpleChannelPath,
    channelIdToPathString,
    channelIdToShortPathString,
    channelIdToLink
  }
}

export default useChannelPath
