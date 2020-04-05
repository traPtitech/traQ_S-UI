import { ChannelTree, ChannelTreeNode } from '@/store/domain/channelTree/state'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from '@traptitech/traq'
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

  // ChannelIdから、そのチャンネルの子チャンネル(孫以下は含まない)の配列を返す
  const channelIdToChildrenSimpleChannel = (id: ChannelId): SimpleChannel[] => {
    let channels: ChannelTreeNode[] =
      store.state.domain.channelTree.channelTree.children
    let children: ChannelTreeNode[] = []
    let isFound: boolean = false
    let targetChildren: SimpleChannel[] = []
    while (!isFound || channels.length === 0) {
      for (const channel of channels) {
        if (channel.id === id) {
          for (const targetChild of channel.children) {
            targetChildren.push({
              id: targetChild.id,
              name: targetChild.name
            })
          }
          isFound = true
        } else if (channel.children.length !== 0) {
          Array.prototype.push.apply(children, channel.children)
        }
      }
      channels = children
      children = []
    }
    return targetChildren
  }

  return {
    channelPathToId,
    channelIdToPath,
    channelIdToSimpleChannelPath,
    channelIdToChildrenSimpleChannel
  }
}

export default useChannelPath
