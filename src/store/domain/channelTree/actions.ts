import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { channelTree } from './index'
import { ActionContext } from 'vuex'
import _store from '@/_store'
import { constructTree, rootChannelId } from '@/lib/channelTree'

export const channelTreeActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, channelTree)

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
          rootState.entities.channelsMap
        )?.children ?? []
    }
    commit.setChannelTree(tree)
  },
  constructHomeChannelTree(context) {
    const { getters, commit, rootState } = channelTreeActionContext(context)
    const topLevelChannelIds = getters.topLevelChannels.map(c => c.id)
    // TODO: 効率が悪いので改善
    const subscribedOrForceChannels = _store.getters.domain.me.subscribedChannels.concat(
      [...rootState.entities.channelsMap.values()]
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
          rootState.entities.channelsMap,
          new Set(subscribedOrForceChannels)
        )?.children ?? []
    }
    commit.setHomeChannelTree(tree)
  }
})
