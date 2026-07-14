<template>
  <div ref="scrollEl" :class="$style.container">
    <div ref="titleSectionRef" :class="$style.titleSection">
      <NavigationContentTitle current-navigation="home" />
    </div>

    <template v-if="homeChannelWithTree.length > 0">
      <div ref="homeSectionHeaderRef">
        <NavigationContentContainer subtitle="ホームチャンネル" />
      </div>
      <div ref="homeTreeWrapperRef" :class="$style.treeWrapper">
        <ChannelTree
          :channels="homeChannelWithTree"
          :scroll-element="scrollEl"
          :scroll-margin="homeScrollMargin"
          show-shortened-path
        />
      </div>
    </template>

    <template
      v-if="dmChannelsWithNotification.length + noticeableChannels.length > 0"
    >
      <div ref="mentionSectionRef">
        <NavigationContentContainer subtitle="メンション" />
        <DMChannelList
          v-if="dmChannelsWithNotification.length > 0"
          :dm-channels="dmChannelsWithNotification"
        />
      </div>
      <div ref="mentionTreeWrapperRef" :class="$style.treeWrapper">
        <ChannelTree
          v-if="noticeableChannelNodes.length > 0"
          :channels="noticeableChannelNodes"
          :scroll-element="scrollEl"
          :scroll-margin="mentionScrollMargin"
          show-shortened-path
          :show-star="prioritizeStarredChannel"
        />
      </div>
    </template>

    <template v-if="unreadChannels.length > 0">
      <div ref="unreadSectionHeaderRef">
        <NavigationContentContainer subtitle="未読" />
      </div>
      <div ref="unreadTreeWrapperRef" :class="$style.treeWrapper">
        <ChannelTree
          :channels="unreadChannelNodes"
          :scroll-element="scrollEl"
          :scroll-margin="unreadScrollMargin"
          show-shortened-path
          :show-star="prioritizeStarredChannel"
          :show-notified="prioritizeNotifiedChannel"
        />
      </div>
    </template>

    <div ref="channelSectionHeaderRef">
      <NavigationContentContainer subtitle="チャンネル" />
    </div>
    <div ref="channelContentRef" :class="$style.treeWrapper">
      <ChannelTree
        v-if="topLevelChannels.length > 0"
        :channels="topLevelChannels"
        :scroll-element="scrollEl"
        :scroll-margin="channelsScrollMargin"
      />
      <EmptyState v-else> 購読していません </EmptyState>
    </div>

    <template v-if="qallingChannels.length > 0">
      <div ref="qallSectionHeaderRef">
        <NavigationContentContainer subtitle="Qall中チャンネル" />
      </div>
      <ChannelTree
        :channels="qallingChannelNodes"
        :scroll-element="scrollEl"
        :scroll-margin="qallScrollMargin"
        show-shortened-path
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Channel } from '@traptitech/traq'

import { computed, ref, toRaw } from 'vue'

import { useElementSize } from '@vueuse/core'

import DMChannelList from '/@/components/Main/NavigationBar/DMChannelList/DMChannelList.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import NavigationContentTitle from '/@/components/Main/NavigationBar/NavigationContentTitle.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import { useQall } from '/@/composables/qall/useQall'
import useChannelsWithNotification from '/@/composables/subscription/useChannelsWithNotification'
import { filterTrees } from '/@/lib/basic/tree'
import { constructTreeFromIds } from '/@/lib/channelTree'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

import ChannelTree from '../ChannelList/ChannelTree.vue'

const toNode = (
  ch: Pick<Channel, 'id' | 'name' | 'archived'>
): ChannelTreeNode => ({
  id: ch.id as ChannelId,
  name: ch.name,
  children: [],
  active: true,
  archived: ch.archived
})

const { homeChannelTree } = useChannelTree()
const { detail } = useMeStore()
const { channelsMap } = useChannelsStore()
const { rooms: roomWithParticipants } = useQall()
const { prioritizeNotifiedChannel, prioritizeStarredChannel } =
  useBrowserSettings()

const homeChannelWithTree = computed(() => {
  if (!detail.value?.homeChannel) return []

  const trees = constructTreeFromIds(
    [detail.value.homeChannel],
    channelsMap.value
  )
  return filterTrees(trees, channel => !channel.archived)
})

const { noticeableChannels, unreadChannels, dmChannelsWithNotification } =
  useChannelsWithNotification()

const topLevelChannels = computed(() =>
  filterTrees(toRaw(homeChannelTree.value.children), node => !node.archived)
)

const qallingChannels = computed(() =>
  roomWithParticipants.value.map(room => room.channel)
)

const noticeableChannelNodes = computed(() =>
  noticeableChannels.value.map(toNode)
)
const unreadChannelNodes = computed(() => unreadChannels.value.map(toNode))
const qallingChannelNodes = computed(() => qallingChannels.value.map(toNode))

const scrollEl = ref<HTMLElement | null>(null)
const titleSectionRef = ref<HTMLElement | null>(null)
const homeSectionHeaderRef = ref<HTMLElement | null>(null)
const mentionSectionRef = ref<HTMLElement | null>(null)
const unreadSectionHeaderRef = ref<HTMLElement | null>(null)
const channelSectionHeaderRef = ref<HTMLElement | null>(null)
const qallSectionHeaderRef = ref<HTMLElement | null>(null)

const homeTreeWrapperRef = ref<HTMLElement | null>(null)
const mentionTreeWrapperRef = ref<HTMLElement | null>(null)
const unreadTreeWrapperRef = ref<HTMLElement | null>(null)
const channelContentRef = ref<HTMLElement | null>(null)

const { height: titleSectionHeight } = useElementSize(titleSectionRef)
const { height: homeSectionHeaderHeight } = useElementSize(homeSectionHeaderRef)
const { height: mentionSectionHeight } = useElementSize(mentionSectionRef)
const { height: unreadSectionHeaderHeight } = useElementSize(
  unreadSectionHeaderRef
)
const { height: channelSectionHeaderHeight } = useElementSize(
  channelSectionHeaderRef
)
const { height: homeTreeWrapperHeight } = useElementSize(homeTreeWrapperRef)
const { height: mentionTreeWrapperHeight } = useElementSize(
  mentionTreeWrapperRef
)
const { height: unreadTreeWrapperHeight } = useElementSize(unreadTreeWrapperRef)
const { height: channelContentHeight } = useElementSize(channelContentRef)
const { height: qallSectionHeaderHeight } = useElementSize(qallSectionHeaderRef)

const homeScrollMargin = computed(
  () => titleSectionHeight.value + homeSectionHeaderHeight.value
)
const mentionScrollMargin = computed(
  () =>
    homeScrollMargin.value +
    homeTreeWrapperHeight.value +
    mentionSectionHeight.value
)
const unreadScrollMargin = computed(
  () =>
    mentionScrollMargin.value +
    mentionTreeWrapperHeight.value +
    unreadSectionHeaderHeight.value
)
const channelsScrollMargin = computed(
  () =>
    unreadScrollMargin.value +
    unreadTreeWrapperHeight.value +
    channelSectionHeaderHeight.value
)
const qallScrollMargin = computed(
  () =>
    channelsScrollMargin.value +
    channelContentHeight.value +
    qallSectionHeaderHeight.value
)
</script>

<style lang="scss" module>
.container {
  height: 100%;
  overflow-y: auto;
  padding: 0 0 24px 8px;
}
.titleSection {
  padding-top: 24px;
}
.treeWrapper {
  padding-bottom: 16px;
}
</style>
