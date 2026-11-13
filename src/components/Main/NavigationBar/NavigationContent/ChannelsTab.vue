<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <NavigationContentTitle>チャンネル</NavigationContentTitle>
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
          <HideOnScroll
            :key="isSearching ? 'search' : 'browse'"
            :scroll-element="scrollEl"
          >
            <ChannelListSelector
              v-model:is-starred="isStarredTabSelected"
              :all-panel-id="allPanelId"
              :starred-panel-id="starredPanelId"
            />
            <template #collapsed-decoration>
              <div :class="$style.divider" />
            </template>
          </HideOnScroll>
        </template>
      </NavigationContentContainer>
    </div>

    <div
      ref="scrollEl"
      :class="$style.scroller"
      role="region"
      aria-label="チャンネル一覧"
    >
      <ChannelTree
        v-if="isSearching"
        :id="searchStarredOnly ? starredPanelId : allPanelId"
        role="tabpanel"
        :channels="filteredChannelTree"
        :scroll-element="scrollEl"
        show-topic
        show-shortened-path
        :show-child-topic="false"
      />
      <template v-else-if="filterStarChannel">
        <template v-if="strictStarredChannelTree">
          <ChannelTree
            v-if="starredTopLevelChannels.length > 0"
            :id="starredPanelId"
            role="tabpanel"
            :channels="starredTopLevelChannels"
            :scroll-element="scrollEl"
          />
          <EmptyState v-else :id="starredPanelId" role="tabpanel">
            お気に入りチャンネルはありません
          </EmptyState>
        </template>
        <template v-else>
          <ChannelTree
            v-if="starredChannels.length > 0"
            :id="starredPanelId"
            role="tabpanel"
            :channels="starredChannels"
            show-shortened-path
            :scroll-element="scrollEl"
          />
          <EmptyState v-else :id="starredPanelId" role="tabpanel">
            お気に入りチャンネルはありません
          </EmptyState>
        </template>
      </template>
      <template v-else>
        <ChannelTree
          v-if="topLevelChannels.length > 0"
          :id="allPanelId"
          role="tabpanel"
          :channels="topLevelChannels"
          :scroll-element="scrollEl"
        />
        <EmptyState v-else :id="allPanelId" role="tabpanel">
          チャンネルがありません
        </EmptyState>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRaw, useId, watch } from 'vue'

import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import NavigationContentTitle from '/@/components/Main/NavigationBar/NavigationContentTitle.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import HideOnScroll from '/@/components/UI/HideOnScroll.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { filterTrees } from '/@/lib/basic/tree'
import { sortByChannelPath } from '/@/lib/channel'
import { constructTreeFromIds } from '/@/lib/channelTree'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useStarredChannels } from '/@/store/domain/starredChannels'
import { useChannelsStore } from '/@/store/entities/channels'
import { useModalStore } from '/@/store/ui/modal'

import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import ChannelListSelector from '../ChannelList/ChannelListSelector.vue'
import ChannelTree from '../ChannelList/ChannelTreeWithFeatureFlag.vue'
import ToggleButton from './ToggleButton.vue'
import useChannelFilter from './composables/useChannelFilter'

const { pushModal } = useModalStore()
const { channelTree, starredChannelTree } = useChannelTree()
const { starredChannelSet } = useStarredChannels()
const { channelsMap } = useChannelsStore()
const { channelIdToPathString } = useChannelPath()

const { showArchivedChannels, filterStarChannel, strictStarredChannelTree } =
  useBrowserSettings()

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

const searchStarredOnly = ref(false)
const searchChannelMap = computed(
  () =>
    new Map(
      [...channelsMap.value].filter(
        ([id, channel]) =>
          (showArchivedChannels.value || !channel.archived) &&
          (!searchStarredOnly.value || starredChannelSet.value.has(id))
      )
    )
)

const channelListForFilter = computed(() => [
  ...searchChannelMap.value.values()
])

const { query, filteredChannels } = useChannelFilter(channelListForFilter)
const isSearching = computed(() => query.value.length > 0)
const isStarredTabSelected = computed({
  get: () =>
    isSearching.value ? searchStarredOnly.value : filterStarChannel.value,
  set: isStarred => {
    if (isSearching.value) {
      searchStarredOnly.value = isStarred
    } else {
      filterStarChannel.value = isStarred
    }
  }
})

watch(
  isSearching,
  searching => {
    if (!searching) searchStarredOnly.value = false
  },
  { flush: 'sync' }
)

const filteredChannelTree = computed(() => {
  const rootIds = filteredChannels.value.map(c => c.id)
  return constructTreeFromIds(rootIds, searchChannelMap.value)
})

const onClickButton = () => {
  pushModal({ type: 'channel-create' })
}

const allPanelId = useId()
const starredPanelId = useId()

const scrollEl = ref<HTMLElement | null>(null)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-left: 8px;
}
.header {
  flex-shrink: 0;
  padding-top: 24px;
}
.divider {
  height: 1px;
  background-color: $theme-ui-tertiary-default;
  opacity: 0.45;
}
.scroller {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding-bottom: 24px;
}
.filterContainer {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
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
