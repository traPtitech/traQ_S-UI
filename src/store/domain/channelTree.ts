import { computed, ref, toRaw, watch } from 'vue'

import mitt from 'mitt'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { channelIdToPathString } from '/@/lib/channel'
import type { ChannelTree } from '/@/lib/channelTree'
import { constructTree, rootChannelId } from '/@/lib/channelTree'
import router, { rewriteChannelPath } from '/@/router'
import { entityMitt } from '/@/store/entities/mitt'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId } from '/@/types/entity-ids'

import { useChannelsStore } from '../entities/channels'
import { useStaredChannels } from './staredChannels'
import { useSubscriptionStore } from './subscription'

type ChannelTreeEventMap = {
  created: { id: ChannelId; path: string }
  moved: { id: ChannelId; newPath: string; oldPath: string }
}

export const channelTreeMitt = mitt<ChannelTreeEventMap>()

// 循環参照を回避するためにこっちに書く
channelTreeMitt.on('moved', ({ oldPath, newPath }) => {
  const nowPath = router.currentRoute.value.path
  const rewrittenPath = rewriteChannelPath(nowPath, { oldPath, newPath })
  if (rewrittenPath === null) {
    return
  }

  router.replace({
    path: rewrittenPath
  })
})

const useChannelTreePinia = defineStore('domain/channelTree', () => {
  const subscriptionStore = useSubscriptionStore()
  const channelsStore = useChannelsStore()
  const { staredChannelSet } = useStaredChannels()

  const channelTree = ref<Readonly<ChannelTree>>({ children: [] })
  const homeChannelTree = ref<Readonly<ChannelTree>>({ children: [] })
  const starredChannelTree = ref<Readonly<ChannelTree>>({ children: [] })

  const topLevelChannels = computed(() =>
    [...channelsStore.channelsMap.value.values()].filter(
      channel => channel.parentId === undefined || channel.parentId === null
    )
  )
  const forcedChannels = computed(() =>
    [...channelsStore.channelsMap.value.values()].filter(
      channel => channel.force
    )
  )

  const constructChannelTree = () => {
    const topLevelChannelIds = topLevelChannels.value.map(c => c.id)
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
          // constructTreeは重いのと内部ではreactiveである必要がないのでtoRawする
          toRaw(channelsStore.channelsMap.value)
        )?.children ?? []
    }
    channelTree.value = tree
  }
  const constructHomeChannelTree = () => {
    const topLevelChannelIds = topLevelChannels.value.map(c => c.id)
    // TODO: 効率が悪いので改善
    const subscribedOrForceChannels = new Set([
      ...subscriptionStore.subscribedChannels.value,
      ...forcedChannels.value.map(c => c.id)
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
          // constructTreeは重いのと内部ではreactiveである必要がないのでtoRawする
          toRaw(channelsStore.channelsMap.value),
          toRaw(subscribedOrForceChannels)
        )?.children ?? []
    }
    homeChannelTree.value = tree
  }
  const constructStarredChannelTree = () => {
    const topLevelChannelIds = topLevelChannels.value.map(c => c.id)

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
          // constructTreeは重いのと内部ではreactiveである必要がないのでtoRawする
          toRaw(channelsStore.channelsMap.value),
          toRaw(staredChannelSet.value)
        )?.children ?? []
    }
    starredChannelTree.value = tree
  }

  const constructAllTrees = () => {
    constructChannelTree()
    constructHomeChannelTree()
    constructStarredChannelTree()
  }

  constructAllTrees()

  entityMitt.on('setChannels', () => {
    constructAllTrees()
  })
  entityMitt.on('addChannel', channel => {
    // 新規追加のときはホームに表示されることはないのでhomeChannelTree構築しない
    constructChannelTree()

    const path = channelIdToPathString(
      channel.id,
      channelsStore.channelsMap.value
    )
    channelTreeMitt.emit('created', { id: channel.id, path })
  })
  entityMitt.on('updateChannel', ({ newChannel, oldChannel, oldPath }) => {
    // 名前も親チャンネルもアーカイブ状態も変わっていないなら構造は変わらない
    if (
      newChannel.name === oldChannel.name &&
      newChannel.parentId === oldChannel.parentId &&
      newChannel.archived === oldChannel.archived
    ) {
      return
    }

    constructAllTrees()

    if (
      newChannel.name !== oldChannel.name ||
      newChannel.parentId !== oldChannel.parentId
    ) {
      const newPath = channelIdToPathString(
        newChannel.id,
        channelsStore.channelsMap.value
      )
      channelTreeMitt.emit('moved', { id: newChannel.id, oldPath, newPath })
    }
  })

  watch(subscriptionStore.subscribedChannels, () => {
    constructHomeChannelTree()
  })

  watch(
    staredChannelSet,
    () => {
      constructStarredChannelTree()
    },
    { deep: true }
  )

  return { channelTree, homeChannelTree, starredChannelTree, topLevelChannels }
})

export const useChannelTree = convertToRefsStore(useChannelTreePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChannelTreePinia, import.meta.hot))
}
