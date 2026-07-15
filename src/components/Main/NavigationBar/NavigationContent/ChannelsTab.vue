<template>
  <div ref="scrollEl" :class="$style.container">
    <div ref="headerRef" :class="$style.header">
      <NavigationContentTitle current-navigation="channels" />
      <NavigationContentContainer subtitle="チャンネルリスト">
        <template #control>
          <button :class="$style.button" @click="onClickButton">
            <AIcon :size="20" mdi name="plus-circle-outline" />
          </button>
        </template>
        <template #default>
          <div :class="$style.filterContainer">
            <ChannelFilter v-model="query" :class="$style.filter" />
            <ToggleButton
              v-model="showArchivedChannels"
              icon-name="archive"
              icon-mdi
              title="アーカイブされたチャンネルを表示する"
            />
          </div>
          <ChannelListSelector
            v-if="query.length === 0"
            v-model:is-starred="filterStarChannel"
            :all-panel-id="allPanelId"
            :starred-panel-id="starredPanelId"
          />
        </template>
      </NavigationContentContainer>
    </div>

    <template v-if="query.length > 0">
      <ChannelTree
        :channels="filteredChannelTree"
        :scroll-element="scrollEl"
        :scroll-margin="scrollMargin"
        show-topic
        show-shortened-path
        :show-child-topic="false"
      />
    </template>
    <template v-else-if="filterStarChannel">
      <ChannelTree
        v-if="featureFlags.dose_construct_strict_starred_channel_tree.enabled"
        :id="starredPanelId"
        role="tabpanel"
        :channels="starredTopLevelChannels"
        :scroll-element="scrollEl"
        :scroll-margin="scrollMargin"
      />
      <ChannelTree
        v-else-if="starredChannels.length > 0"
        :id="starredPanelId"
        role="tabpanel"
        :channels="starredChannels"
        show-shortened-path
        :scroll-element="scrollEl"
        :scroll-margin="scrollMargin"
      />
      <EmptyState v-else :id="starredPanelId" role="tabpanel">
        お気に入りチャンネルはありません
      </EmptyState>
    </template>
    <template v-else>
      <ChannelTree
        v-if="topLevelChannels.length > 0"
        :id="allPanelId"
        role="tabpanel"
        :channels="topLevelChannels"
        :scroll-element="scrollEl"
        :scroll-margin="scrollMargin"
      />
      <EmptyState v-else :id="allPanelId" role="tabpanel">
        チャンネルがありません
      </EmptyState>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRaw, useId } from 'vue'

import { useElementSize } from '@vueuse/core'

import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import NavigationContentTitle from '/@/components/Main/NavigationBar/NavigationContentTitle.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { filterTrees } from '/@/lib/basic/tree'
import { sortByChannelPath } from '/@/lib/channel'
import { constructTreeFromIds } from '/@/lib/channelTree'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useStarredChannels } from '/@/store/domain/starredChannels'
import { useChannelsStore } from '/@/store/entities/channels'
import { useModalStore } from '/@/store/ui/modal'

import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import ChannelListSelector from '../ChannelList/ChannelListSelector.vue'
import ChannelTree from '../ChannelList/ChannelTree.vue'
import ToggleButton from './ToggleButton.vue'
import useChannelFilter from './composables/useChannelFilter'

const { pushModal } = useModalStore()
const { channelTree, starredChannelTree } = useChannelTree()
const { starredChannelSet } = useStarredChannels()
const { channelsMap } = useChannelsStore()
const { channelIdToPathString } = useChannelPath()

const { showArchivedChannels, filterStarChannel } = useBrowserSettings()

const topLevelChannels = computed(() =>
  filterTrees(
    toRaw(channelTree.value.children),
    channel => showArchivedChannels.value || !channel.archived
  )
)
const starredTopLevelChannels = computed(() =>
  filterTrees(
    toRaw(starredChannelTree.value.children),
    node => showArchivedChannels.value || !node.archived
  )
)

const starredChannels = computed(() => {
  const trees = constructTreeFromIds(
    [...starredChannelSet.value],
    channelsMap.value
  )
  const getPath = (id: string) => channelIdToPathString(id)?.toUpperCase() ?? ''
  return filterTrees(
    sortByChannelPath(trees, getPath),
    channel => showArchivedChannels.value || !channel.archived
  )
})

const { featureFlags } = useFeatureFlagSettings()

const channelListForFilter = computed(() =>
  [...channelsMap.value.values()].filter(
    channel => showArchivedChannels.value || !channel.archived
  )
)
const { query, filteredChannels } = useChannelFilter(channelListForFilter)

const filteredChannelTree = computed(() => {
  const rootIds = filteredChannels.value.map(c => c.id)
  return filterTrees(
    constructTreeFromIds(rootIds, channelsMap.value),
    channel => showArchivedChannels.value || !channel.archived
  )
})

const onClickButton = () => {
  pushModal({ type: 'channel-create' })
}

const allPanelId = useId()
const starredPanelId = useId()

const scrollEl = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const { height: headerHeight } = useElementSize(headerRef)
const scrollMargin = computed(() => headerHeight.value)
</script>

<style lang="scss" module>
.container {
  height: 100%;
  overflow-y: auto;
  padding: 0 0 24px 8px;
}
.header {
  padding-top: 24px;
}
.filterContainer {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  margin-right: 1rem;
}
.filter {
  flex: 1;
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
