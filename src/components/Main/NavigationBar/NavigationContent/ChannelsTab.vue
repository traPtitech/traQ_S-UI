<template>
  <div>
    <NavigationContentContainer subtitle="チャンネルリスト">
      <template #control>
        <button :class="$style.button" @click="onClickButton">
          <AIcon :size="20" mdi name="plus-circle-outline" />
        </button>
      </template>
      <template #default>
        <ChannelFilter v-model="query" :class="$style.filter" />
        <ChannelListSelector
          v-if="query.length === 0"
          v-model:is-starred="filterStarChannel"
          :all-panel-id="allPanelId"
          :stared-panel-id="staredPanelId"
        />
        <template v-if="topLevelChannels.length > 0">
          <ChannelTreeComponent
            v-if="query.length > 0"
            :channels="filteredChannelTree"
            show-topic
            show-shortened-path
          />
          <template v-else-if="filterStarChannel">
            <template v-if="staredChannels.length > 0">
              <ChannelTreeComponent
                v-if="
                  featureFlags.dose_construct_strict_starred_channel_tree
                    .enabled
                "
                :id="staredPanelId"
                :channels="starredTopLevelChannels"
              />
              <ChannelTreeComponent
                v-else
                :id="staredPanelId"
                :channels="staredChannels"
                show-shortened-path
                role="tabpanel"
              />
            </template>
            <EmptyState v-else :id="staredPanelId" role="tabpanel">
              お気に入りチャンネルはありません
            </EmptyState>
          </template>
          <ChannelTreeComponent
            v-else
            :id="allPanelId"
            :channels="topLevelChannels"
            role="tabpanel"
          />
        </template>
        <EmptyState v-else> チャンネルがありません </EmptyState>
      </template>
    </NavigationContentContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRaw } from 'vue'

import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { randomString } from '/@/lib/basic/randomString'
import { filterTrees } from '/@/lib/basic/tree'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import { constructTreeFromIds } from '/@/lib/channelTree'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import { useChannelsStore } from '/@/store/entities/channels'
import { useModalStore } from '/@/store/ui/modal'

import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import ChannelListSelector from '../ChannelList/ChannelListSelector.vue'
import ChannelTreeComponent from '../ChannelList/ChannelTree.vue'
import useChannelFilter from './composables/useChannelFilter'

const { pushModal } = useModalStore()
const { channelTree, starredChannelTree } = useChannelTree()
const { staredChannelSet } = useStaredChannels()
const { channelsMap } = useChannelsStore()
const { channelIdToPathString } = useChannelPath()

// filterTreesは重いのと内部ではreactiveである必要がないのでtoRawする
const topLevelChannels = computed(() =>
  filterTrees(toRaw(channelTree.value.children), channel => !channel.archived)
)
const starredTopLevelChannels = computed(() =>
  filterTrees(toRaw(starredChannelTree.value.children), node => !node.archived)
)

const staredChannels = computed(() => {
  const trees = constructTreeFromIds(
    [...staredChannelSet.value],
    channelsMap.value
  )
  const sortedTrees = sortChannelTree(trees)
  return filterTrees(sortedTrees, channel => !channel.archived)
})

const sortChannelTree = (tree: ChannelTreeNode[]): ChannelTreeNode[] => {
  const mapped = tree.map((node, index) => ({
    index,
    pathString: channelIdToPathString(node.id)?.toUpperCase() ?? ''
  }))
  mapped.sort((a, b) => {
    if (a.pathString > b.pathString) {
      return 1
    }
    if (a.pathString < b.pathString) {
      return -1
    }
    return 0
  })

  return mapped
    .map(v => tree[v.index])
    .filter((v): v is ChannelTreeNode => v !== undefined)
}

const { featureFlags } = useFeatureFlagSettings()

const { filterStarChannel } = useBrowserSettings()
const channelListForFilter = computed(() =>
  [...channelsMap.value.values()].filter(channel => !channel.archived)
)
const { query, filteredChannels } = useChannelFilter(channelListForFilter)

const filteredChannelTree = computed(() => {
  const filteredIds = new Set(filteredChannels.value.map(c => c.id))
  const rootIds = filteredChannels.value
    .filter(c => c.parentId === null || !filteredIds.has(c.parentId))
    .map(c => c.id)

  return constructTreeFromIds(rootIds, channelsMap.value)
})

const onClickButton = () => {
  pushModal({
    type: 'channel-create'
  })
}

const allPanelId = randomString()
const staredPanelId = randomString()
</script>

<style lang="scss" module>
.filter {
  margin-bottom: 16px;
}
.button {
  @include color-ui-secondary-inactive;
  padding-right: 16px;
  cursor: pointer;
  &:hover,
  &:focus {
    @include color-ui-secondary;
  }
}
</style>
