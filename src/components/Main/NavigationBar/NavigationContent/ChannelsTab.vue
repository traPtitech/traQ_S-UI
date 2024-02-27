<template>
  <div>
    <navigation-content-container subtitle="チャンネルリスト">
      <template #control>
        <button :class="$style.button" @click="onClickButton">
          <a-icon :size="20" mdi name="plus-circle-outline" />
        </button>
      </template>
      <template #default>
        <channel-filter
          v-model="query"
          v-model:is-stared="filterStarChannel"
          :class="$style.filter"
        />
        <channel-list-selector
          v-if="query.length === 0"
          v-model:is-stared="filterStarChannel"
          :all-panel-id="allPanelId"
          :stared-panel-id="staredPanelId"
        />
        <template v-if="topLevelChannels.length > 0">
          <channel-list
            v-if="query.length > 0"
            :channels="filteredChannels"
            show-topic
          />
          <template v-else-if="filterStarChannel">
            <channel-tree-component
              v-if="staredChannels.length > 0"
              :id="staredPanelId"
              :channels="staredChannels"
              show-shortened-path
              role="tabpanel"
            />
            <empty-state v-else :id="staredPanelId" role="tabpanel">
              お気に入りチャンネルはありません
            </empty-state>
          </template>
          <channel-tree-component
            v-else
            :id="allPanelId"
            :channels="topLevelChannels"
            role="tabpanel"
          />
        </template>
        <empty-state v-else>チャンネルがありません</empty-state>
      </template>
    </navigation-content-container>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRaw } from 'vue'
import useChannelFilter from './composables/useChannelFilter'
import { useModalStore } from '/@/store/ui/modal'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import ChannelList from '../ChannelList/ChannelList.vue'
import ChannelTreeComponent from '../ChannelList/ChannelTree.vue'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import { filterTrees } from '/@/lib/basic/tree'
import { constructTreeFromIds } from '/@/lib/channelTree'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import useStaredChannelDescendants from './composables/useStaredChannelDescendants'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import useChannelPath from '/@/composables/useChannelPath'
import ChannelListSelector from '../ChannelList/ChannelListSelector.vue'
import { randomString } from '/@/lib/basic/randomString'

const { pushModal } = useModalStore()

const { channelTree } = useChannelTree()
const { staredChannelSet } = useStaredChannels()
const { channelsMap } = useChannelsStore()
const { channelIdToPathString } = useChannelPath()
const topLevelChannels = computed(() =>
  // filterTreesは重いのと内部ではreactiveである必要がないのでtoRawする
  filterTrees(toRaw(channelTree.value.children), channel => !channel.archived)
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
    pathString: channelIdToPathString(node.id).toUpperCase()
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

const { filterStarChannel } = useBrowserSettings()
const staredChannelDescendantList = useStaredChannelDescendants()
const channelListForFilter = computed(() =>
  [...channelsMap.value.values()].filter(channel => !channel.archived)
)
const { query, filteredChannels } = useChannelFilter(channelListForFilter)

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
