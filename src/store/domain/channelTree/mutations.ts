import { defineMutations } from 'direct-vuex'
import { S, ChannelTreeNode, rootChannelId, dmChannelId } from './state'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from '@/lib/api'
import store from '@/store'

const channelNameSortFunction = (
  channelEntities: Record<ChannelId, Channel>
) => (node1: ChannelTreeNode, node2: ChannelTreeNode) => {
  // sort by channel name
  const name1 = channelEntities[node1.channelId].name?.toUpperCase() ?? ''
  const name2 = channelEntities[node2.channelId].name?.toUpperCase() ?? ''
  return name1 < name2 ? -1 : name1 > name2 ? 1 : 0
}

// TODO v3 APIの型に合わせる
export const constructTree = (
  channelId: ChannelId,
  channelEntities: Record<ChannelId, Channel>,
  subscribedChannels?: Set<ChannelId>
): ChannelTreeNode | undefined => {
  const channel = channelEntities[channelId]
  if (!channel) {
    throw 'Channel Not found'
  }
  if (channel.channelId === undefined) {
    throw 'Channel has no channel id'
  }
  if (channel.name === undefined) {
    throw 'Channel has no name'
  }

  const isSubscribed =
    channelId === '' || (subscribedChannels?.has(channelId) ?? true)

  if (!channel.children || channel.children.length === 0) {
    // 葉チャンネル
    return isSubscribed
      ? {
          channelId,
          name: channel.name,
          active: true,
          children: []
        }
      : undefined
  }

  /** 表示しないものをフィルタした子孫チャンネル */
  const children = channel.children
    .reduce((acc, id) => {
      const result = constructTree(id, channelEntities, subscribedChannels)
      return result ? [...acc, result] : acc
    }, [] as ChannelTreeNode[])
    .sort(channelNameSortFunction(channelEntities))

  if (children.length === 0 && !isSubscribed) {
    // 子がいない非購読チャンネル
    return undefined
  }
  if (children.length === 1 && !isSubscribed) {
    // 子が1つの非購読チャンネル
    return children[0]
  }
  // 子が2つ以上か、購読チャンネル
  return {
    channelId,
    name: channel.name,
    active: isSubscribed,
    children
  }
}

export const mutations = defineMutations<S>()({
  constructAllTrees() {
    store.commit.domain.channelTree.constructChannelTree()
    store.commit.domain.channelTree.constructHomeChannelTree()
    store.commit.domain.channelTree.constructDmChannelTree()
  },
  constructChannelTree(state) {
    state.channelTree = {
      channelId: rootChannelId,
      name: '',
      active: true,
      children:
        constructTree(rootChannelId, store.state.entities.channels)?.children ??
        []
    }
  },
  constructHomeChannelTree(state) {
    state.homeChannelTree = {
      channelId: rootChannelId,
      name: '',
      active: true,
      children:
        constructTree(
          dmChannelId,
          store.state.entities.channels,
          new Set(store.state.domain.me.subscribedChannels)
        )?.children ?? []
    }
  },
  constructDmChannelTree(state) {
    state.dmChannelTree = {
      channelId: dmChannelId,
      name: '',
      active: true,
      children:
        constructTree(dmChannelId, store.state.entities.channels)?.children ??
        []
    }
  }
})
