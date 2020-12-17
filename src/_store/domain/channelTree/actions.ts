import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { Channel } from '@traptitech/traq'
import { compareString } from '@/lib/util/string'
import { ChannelId } from '@/types/entity-ids'
import { channelTree } from './index'
import { ChannelTreeNode, rootChannelId } from './state'
import { ActionContext } from 'vuex'
import store from '@/store'

export const channelTreeActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, channelTree)

const channelNameSortFunction = (
  channelEntities: Map<ChannelId, ChannelLike>
) => (node1: ChannelTreeNode, node2: ChannelTreeNode) => {
  // sort by channel name
  const name1 = channelEntities.get(node1.id)?.name.toUpperCase()
  const name2 = channelEntities.get(node2.id)?.name.toUpperCase()
  return compareString(name1, name2)
}

export type ChannelLike = Pick<
  Channel,
  'id' | 'name' | 'parentId' | 'children' | 'archived'
>

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

export const actions = defineActions({
  async constructAllTrees(context) {
    const { dispatch } = channelTreeActionContext(context)
    await Promise.all([
      dispatch.constructChannelTree(),
      dispatch.constructHomeChannelTree()
    ])
  },
  constructChannelTree(context) {
    const { getters, commit, rootState } = channelTreeActionContext(context)
    const topLevelChannelIds = getters.topLevelChannels.map(c => c.id)

    const tree = {
      children:
        constructTree(
          {
            id: rootChannelId,
            name: '',
            parentId: null,
            archived: false,
            children: topLevelChannelIds
          },
          store.state.entities.channelsMap
        )?.children ?? []
    }
    commit.setChannelTree(tree)
  },
  constructHomeChannelTree(context) {
    const {
      getters,
      commit,
      rootState,
      rootGetters
    } = channelTreeActionContext(context)
    const topLevelChannelIds = getters.topLevelChannels.map(c => c.id)
    // TODO: 効率が悪いので改善
    const subscribedOrForceChannels = rootGetters.domain.me.subscribedChannels.concat(
      [...store.state.entities.channelsMap.values()]
        .filter(c => c.force)
        .map(c => c.id)
    )
    const tree = {
      children:
        constructTree(
          {
            id: rootChannelId,
            name: '',
            parentId: null,
            archived: false,
            children: topLevelChannelIds
          },
          store.state.entities.channelsMap,
          new Set(subscribedOrForceChannels)
        )?.children ?? []
    }
    commit.setHomeChannelTree(tree)
  }
})
