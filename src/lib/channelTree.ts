import { Channel } from '@traptitech/traq'
import { ChannelId } from '@/types/entity-ids'
import { nullUuid } from '@/lib/util/uuid'
import { compareString } from '@/lib/util/string'

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
  channelEntities: Map<ChannelId, ChannelLike>
) => (node1: ChannelTreeNode, node2: ChannelTreeNode) => {
  // sort by channel name
  const name1 = channelEntities.get(node1.id)?.name.toUpperCase()
  const name2 = channelEntities.get(node2.id)?.name.toUpperCase()
  return compareString(name1, name2)
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
      return result ? [...acc, result] : acc
    }, [] as ChannelTreeNode[])
    .sort(channelNameSortFunction(channelEntities))
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
