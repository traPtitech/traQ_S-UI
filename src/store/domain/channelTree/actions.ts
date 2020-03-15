import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { channelTree } from './index'
import { rootChannelId } from './state'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from '@/lib/api'
import { ChannelTreeNode } from './state'

export const channelTreeActionContext = (context: any) =>
  moduleActionContext(context, channelTree)

const channelNameSortFunction = (
  channelEntities: Record<ChannelId, Channel>
) => (node1: ChannelTreeNode, node2: ChannelTreeNode) => {
  // sort by channel name
  const name1 = channelEntities[node1.id].name?.toUpperCase() ?? ''
  const name2 = channelEntities[node2.id].name?.toUpperCase() ?? ''
  return name1 < name2 ? -1 : name1 > name2 ? 1 : 0
}

type ChannelLike = Pick<Channel, 'id' | 'name' | 'parentId' | 'children'>

export const constructTree = (
  channel: ChannelLike,
  channelEntities: Record<ChannelId, Channel>,
  subscribedChannels?: Set<ChannelId>
): ChannelTreeNode | undefined => {
  if (channel.id === undefined) {
    throw 'Channel has no channel id'
  }
  if (channel.name === undefined) {
    throw 'Channel has no name'
  }

  const isRootChannel = channel.id === rootChannelId
  const isSubscribed =
    isRootChannel || (subscribedChannels?.has(channel.id) ?? true)

  if (channel.children === undefined || channel.children.length === 0) {
    // 葉チャンネル
    return isSubscribed
      ? {
          id: channel.id,
          name: channel.name,
          active: true,
          children: []
        }
      : undefined
  }

  /** 表示しないものをフィルタした子孫チャンネル */
  const children = channel.children
    .reduce((acc, id) => {
      const child = channelEntities[id]
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
    children
  }
}

export const actions = defineActions({
  constructAllTrees(context) {
    const { dispatch } = channelTreeActionContext(context)
    dispatch.constructChannelTree()
    dispatch.constructHomeChannelTree()
  },
  constructChannelTree(context) {
    const { getters, commit, rootState } = channelTreeActionContext(context)
    const topLevelChannelIds = getters.topLevelChannels.map(c => c.id ?? '')
    const tree = {
      children:
        constructTree(
          {
            id: rootChannelId,
            name: '',
            children: topLevelChannelIds
          },
          rootState.entities.channels
        )?.children ?? []
    }
    commit.setChannelTree(tree)
  },
  constructHomeChannelTree(context) {
    const { getters, commit, rootState } = channelTreeActionContext(context)
    const topLevelChannelIds = getters.topLevelChannels.map(c => c.id ?? '')
    const tree = {
      children:
        constructTree(
          {
            id: rootChannelId,
            name: '',
            children: topLevelChannelIds
          },
          rootState.entities.channels,
          new Set(rootState.domain.me.subscribedChannels)
        )?.children ?? []
    }
    commit.setHomeChannelTree(tree)
  }
})
