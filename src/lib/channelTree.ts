import { Channel } from '@traptitech/traq'
import { ChannelId } from '@/types/entity-ids'
import { nullUuid } from '@/lib/util/uuid'
import { compareStringInsensitive } from '@/lib/util/string'

export const rootChannelId = nullUuid
export type RootChannelId = typeof rootChannelId

export type ChannelLike = Pick<
  Channel,
  'id' | 'name' | 'parentId' | 'children' | 'archived'
>

export interface ChannelTreeNode {
  id: ChannelId
  name: string
  children: ChannelTreeNode[]
  active: boolean
  archived: boolean
  /**
   * スキップされた子孫 (子から親への順番)
   */
  skippedAncestorNames?: string[]
}

export interface ChannelTree {
  children: ChannelTreeNode[]
}

const channelNameSortFunction = (
  node1: ChannelTreeNode,
  node2: ChannelTreeNode
) => {
  // sort by channel name
  return compareStringInsensitive(node1.name, node2.name)
}

export const constructTree = (
  channel: ChannelLike,
  channelEntities: Map<ChannelId, ChannelLike>,
  subscribedChannels?: Set<ChannelId>
): ChannelTreeNode | undefined => {
  const isRootChannel = channel.id === rootChannelId
  const isSubscribed =
    isRootChannel || (subscribedChannels?.has(channel.id) ?? true)

  if (channel.children.length === 0) {
    // 葉チャンネル
    return isSubscribed
      ? {
          id: channel.id,
          name: channel.name,
          active: true,
          archived: channel.archived,
          children: []
        }
      : undefined
  }

  /** 表示しないものをフィルタした子孫チャンネル */
  const children = channel.children
    .reduce((acc, id) => {
      const child = channelEntities.get(id)
      if (!child) {
        return acc
      }
      const result = constructTree(child, channelEntities, subscribedChannels)
      if (result) {
        acc.push(result)
      }
      return acc
    }, [] as ChannelTreeNode[])
    .sort(channelNameSortFunction)
  if (children.length === 0 && !isSubscribed) {
    // 子がいない非購読チャンネル
    return undefined
  }
  if (children.length === 1 && !isSubscribed) {
    // 子が1つの非購読チャンネル
    const ancestorNames = children[0].skippedAncestorNames ?? []
    ancestorNames.push(channel.name)
    return {
      ...children[0],
      skippedAncestorNames: ancestorNames
    }
  }
  // 子が2つ以上か、購読チャンネル
  return {
    id: channel.id,
    name: channel.name,
    active: isSubscribed,
    archived: channel.archived,
    children
  }
}

export const channelPathToId = (
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
