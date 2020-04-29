import { ChannelTree, ChannelTreeNode } from '@/store/domain/channelTree/state'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { dmParentUuid } from '@/lib/util/uuid'

type SimpleChannel = {
  id: ChannelId
  name: string
}

const useChannelPath = () => {
  const channelPathToId = (
    separatedPath: string[],
    channelTree: ChannelTree | ChannelTreeNode
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

  const channelIdToSimpleChannelPath = (id: ChannelId): SimpleChannel[] => {
    if (!(id in store.state.entities.channels)) {
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

  const channelIdToPath = (id: ChannelId): string[] =>
    channelIdToSimpleChannelPath(id).map(c => c.name)

  const dmChannelIdToPathString = (id: ChannelId, hashed = false): string =>
    (hashed ? '@' : '') +
      store.state.entities.users[store.state.entities.dmChannels[id].userId]
        ?.name ?? ''

  const channelIdToPathString = (id: ChannelId, hashed = false): string => {
    if (id in store.state.entities.dmChannels)
      return dmChannelIdToPathString(id, hashed)
    return (hashed ? '#' : '') + channelIdToPath(id).join('/')
  }

  const channelIdToShortPathString = (
    id: ChannelId,
    hashed = false
  ): string => {
    if (id in store.state.entities.dmChannels)
      return dmChannelIdToPathString(id, hashed)
    const channels = channelIdToPath(id)
    const formattedChannels = channels.slice(0, -1).map(c => c[0])
    formattedChannels.push(channels.pop() ?? '')
    return (hashed ? '#' : '') + formattedChannels.join('/')
  }

  return {
    channelPathToId,
    channelIdToPath,
    channelIdToSimpleChannelPath,
    channelIdToPathString,
    channelIdToShortPathString
  }
}

export default useChannelPath
