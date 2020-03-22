import { ChannelTree, ChannelTreeNode } from '@/store/domain/channelTree/state'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from '@/lib/api'

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

  const channelIdToPath = (
    id: ChannelId,
    channelEntities: Record<ChannelId, Channel>
  ): string[] => {
    if (!(id in channelEntities)) {
      throw `channelIdToPath: No channel: ${id}`
    }
    const channel = channelEntities[id]
    if (channel.parentId === '' || !channel.parentId) {
      return [channel.name ?? '']
    }
    return [
      ...channelIdToPath(channel.parentId, channelEntities),
      channel.name ?? ''
    ]
  }
  return { channelPathToId, channelIdToPath }
}

export default useChannelPath
