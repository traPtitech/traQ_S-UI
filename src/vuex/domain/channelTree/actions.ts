import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/vuex'
import { channelTree, channelTreeMitt } from '.'
import { ActionContext } from 'vuex'
import store from '/@/vuex'
import { constructTree, rootChannelId } from '/@/lib/channelTree'
import { Channel } from '@traptitech/traq'
import { channelIdToPathString } from '/@/lib/channel'

export const channelTreeActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, channelTree)

export const actions = defineActions({
  onSetChannels(context) {
    const { dispatch } = channelTreeActionContext(context)
    dispatch.constructAllTrees()
  },
  async onAddChannel(context, channel: Channel) {
    const { rootState, dispatch } = channelTreeActionContext(context)

    // 新規追加のときはホームに表示されることはないのでhomeChannelTree構築しない
    await dispatch.constructChannelTree()

    const path = channelIdToPathString(
      channel.id,
      rootState.entities.channelsMap
    )
    channelTreeMitt.emit('created', { id: channel.id, path })
  },
  async onUpdateChannel(
    context,
    {
      newChannel,
      oldChannel,
      oldPath
    }: { newChannel: Channel; oldChannel: Channel; oldPath: string }
  ) {
    const { rootState, dispatch } = channelTreeActionContext(context)

    await dispatch.constructAllTrees()

    if (
      newChannel.name !== oldChannel.name ||
      newChannel.parentId !== oldChannel.parentId
    ) {
      const newPath = channelIdToPathString(
        newChannel.id,
        rootState.entities.channelsMap
      )
      channelTreeMitt.emit('moved', { id: newChannel.id, oldPath, newPath })
    }
  },

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
    const subscribedOrForceChannels = new Set([
      ...store.getters.domain.me.subscribedChannels,
      ...getters.forcedChannels.map(c => c.id)
    ])
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
          subscribedOrForceChannels
        )?.children ?? []
    }
    commit.setHomeChannelTree(tree)
  }
})
