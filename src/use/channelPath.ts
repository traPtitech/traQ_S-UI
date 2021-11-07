import { ChannelId, DMChannelId } from '/@/types/entity-ids'
import store from '/@/store'
import { constructUserPath, constructChannelPath } from '/@/router'
import {
  channelIdToSimpleChannelPath as libChannelIdToSimpleChannelPath,
  SimpleChannel
} from '/@/lib/channel'
import { channelPathToId } from '/@/lib/channelTree'

const useChannelPath = () => {
  const channelIdToSimpleChannelPath = (
    id: ChannelId | DMChannelId
  ): SimpleChannel[] => {
    if (store.state.entities.dmChannelsMap.has(id)) {
      return [
        {
          id,
          name: store.getters.entities.userNameByDMChannelId(id) ?? ''
        }
      ]
    } else if (!store.state.entities.channelsMap.has(id)) {
      throw `channelIdToPath: No channel: ${id}`
    }
    return libChannelIdToSimpleChannelPath(id, store.state.entities.channelsMap)
  }

  const channelIdToPath = (id: ChannelId | DMChannelId): string[] =>
    channelIdToSimpleChannelPath(id).map(c => c.name)

  const dmChannelIdToPathString = (id: DMChannelId, hashed = false): string =>
    (hashed ? '@' : '') +
    (store.getters.entities.userNameByDMChannelId(id) ?? '')

  const channelIdToPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (store.state.entities.dmChannelsMap.has(id))
      return dmChannelIdToPathString(id, hashed)
    return (hashed ? '#' : '') + channelIdToPath(id).join('/')
  }

  const channelIdToShortPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (store.state.entities.dmChannelsMap.has(id)) {
      return dmChannelIdToPathString(id, hashed)
    }
    const channels = channelIdToPath(id)
    const formattedChannels = channels.slice(0, -1).map(c => c[0])
    formattedChannels.push(channels.pop() ?? '')
    return (hashed ? '#' : '') + formattedChannels.join('/')
  }

  const channelIdToLink = (id: ChannelId | DMChannelId) => {
    const pathString = channelIdToPathString(id, false)
    if (store.state.entities.dmChannelsMap.has(id)) {
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
