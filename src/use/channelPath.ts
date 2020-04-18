import { ChannelTree, ChannelTreeNode } from '@/store/domain/channelTree/state'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'

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

    const nextTree = channelTree.children.find(
      child => child.name === separatedPath[0]
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
    if (!channel.parentId) {
      return [{ id, name: channel.name }]
    }
    return [
      ...channelIdToSimpleChannelPath(channel.parentId),
      { id, name: channel.name }
    ]
  }

  const channelIdToPath = (id: ChannelId): string[] =>
    channelIdToSimpleChannelPath(id).map(c => c.name)

  const channelIdToPathString = (id: ChannelId, hashed = false): string =>
    (hashed ? '#' : '') + channelIdToPath(id).join('/')

  return {
    channelPathToId,
    channelIdToPath,
    channelIdToSimpleChannelPath,
    channelIdToPathString
  }
}

export default useChannelPath
