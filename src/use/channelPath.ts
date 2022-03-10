import { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { constructUserPath, constructChannelPath } from '/@/router'
import {
  channelIdToSimpleChannelPath as libChannelIdToSimpleChannelPath,
  SimpleChannel
} from '/@/lib/channel'
import { channelPathToId } from '/@/lib/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '../store/entities/users'

const useChannelPath = () => {
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const { usersMap } = useUsersStore()

  const getUserNameByDMChannelId = (dmChannelId: DMChannelId) => {
    const dmChannel = dmChannelsMap.value.get(dmChannelId)
    if (!dmChannel) return ''
    return usersMap.value.get(dmChannel.userId)?.name ?? ''
  }

  const channelIdToSimpleChannelPath = (
    id: ChannelId | DMChannelId
  ): SimpleChannel[] => {
    if (dmChannelsMap.value.has(id)) {
      return [
        {
          id,
          name: getUserNameByDMChannelId(id)
        }
      ]
    } else if (!channelsMap.value.has(id)) {
      throw `channelIdToPath: No channel: ${id}`
    }
    return libChannelIdToSimpleChannelPath(id, channelsMap.value)
  }

  const channelIdToPath = (id: ChannelId | DMChannelId): string[] =>
    channelIdToSimpleChannelPath(id).map(c => c.name)

  const dmChannelIdToPathString = (id: DMChannelId, hashed = false): string =>
    (hashed ? '@' : '') + (getUserNameByDMChannelId(id) ?? '')

  const channelIdToPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (dmChannelsMap.value.has(id)) return dmChannelIdToPathString(id, hashed)
    return (hashed ? '#' : '') + channelIdToPath(id).join('/')
  }

  const channelIdToShortPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (dmChannelsMap.value.has(id)) {
      return dmChannelIdToPathString(id, hashed)
    }
    const channels = channelIdToPath(id)
    const formattedChannels = channels.slice(0, -1).map(c => c[0])
    formattedChannels.push(channels.pop() ?? '')
    return (hashed ? '#' : '') + formattedChannels.join('/')
  }

  const channelIdToLink = (id: ChannelId | DMChannelId) => {
    const pathString = channelIdToPathString(id, false)
    if (dmChannelsMap.value.has(id)) {
      return constructUserPath(pathString)
    }
    return constructChannelPath(pathString)
  }

  return {
    channelPathToId,
    channelIdToPath,
    channelIdToSimpleChannelPath,
    channelIdToPathString,
    channelIdToShortPathString,
    channelIdToLink
  }
}

export default useChannelPath
