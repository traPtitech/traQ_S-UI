import { ChannelTree, ChannelTreeNode } from '@/_store/domain/channelTree/state'
import { ChannelId, DMChannelId } from '@/types/entity-ids'
import store from '@/_store'
import { dmParentUuid } from '@/lib/util/uuid'
import { constructUserPath, constructChannelPath } from '@/router'

type SimpleChannel = {
  id: ChannelId
  name: string
}

const useChannelPath = () => {
  const channelPathToId = (
    separatedPath: readonly string[],
    channelTree: Readonly<ChannelTree | ChannelTreeNode>
  ): string => {
    if (separatedPath.length === 0) {
      throw 'channelPathToId: Empty path'
    }

    const loweredChildName = separatedPath[0].toLowerCase()
    const nextTree = channelTree.children.find(
      child => child.name.toLowerCase() === loweredChildName
    )
    if (!nextTree) {
      throw `channelPathToId: No channel: ${separatedPath[0]}`
    }
    if (separatedPath.length === 1) {
      return nextTree.id
    }

    return channelPathToId(separatedPath.slice(1), nextTree)
  }

  const channelIdToSimpleChannelPath = (
    id: ChannelId | DMChannelId
  ): SimpleChannel[] => {
    if (id in store.state.entities.dmChannels) {
      return [
        {
          id,
          name: store.getters.entities.userNameByDMChannelId(id) ?? ''
        }
      ]
    } else if (!(id in store.state.entities.channels)) {
      throw `channelIdToPath: No channel: ${id}`
    }
    const channel = store.state.entities.channels[id]
    if (!channel.parentId || channel.parentId === dmParentUuid) {
      return [{ id, name: channel.name }]
    }
    return [
      ...channelIdToSimpleChannelPath(channel.parentId),
      { id, name: channel.name }
    ]
  }

  const channelIdToPath = (id: ChannelId | DMChannelId): string[] =>
    channelIdToSimpleChannelPath(id).map(c => c.name)

  const dmChannelIdToPathString = (id: DMChannelId, hashed = false): string =>
    (hashed ? '@' : '') + store.getters.entities.userNameByDMChannelId(id) ?? ''

  const channelIdToPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (id in store.state.entities.dmChannels)
      return dmChannelIdToPathString(id, hashed)
    return (hashed ? '#' : '') + channelIdToPath(id).join('/')
  }

  const channelIdToShortPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (id in store.state.entities.dmChannels)
      return dmChannelIdToPathString(id, hashed)
    const channels = channelIdToPath(id)
    const formattedChannels = channels.slice(0, -1).map(c => c[0])
    formattedChannels.push(channels.pop() ?? '')
    return (hashed ? '#' : '') + formattedChannels.join('/')
  }

  const channelIdToLink = (id: ChannelId | DMChannelId) => {
    const pathString = channelIdToPathString(id, false)
    if (id in store.state.entities.dmChannels)
      return constructUserPath(pathString)
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
