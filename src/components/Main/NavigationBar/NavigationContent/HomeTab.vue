<template>
  <div>
    <NavigationContentContainer
      v-if="homeChannelWithTree.length > 0"
      subtitle="ホームチャンネル"
      :class="$style.item"
    >
      <ChannelTree :channels="homeChannelWithTree" show-shortened-path />
    </NavigationContentContainer>
    <div>
      <NavigationContentContainer
        v-if="
          dmChannelsWithNotification.length + noticeableChannels.length !== 0
        "
        subtitle="メンション"
        :class="$style.item"
      >
        <DMChannelList :dm-channels="dmChannelsWithNotification" />
        <ChannelList
          :channels-or-clip-folders="noticeableChannels"
          :show-star="prioritizeStarredChannel"
        />
      </NavigationContentContainer>
      <NavigationContentContainer
        v-if="unreadChannels.length > 0"
        subtitle="未読"
        :class="$style.item"
      >
        <ChannelList
          :channels-or-clip-folders="unreadChannels"
          :show-star="prioritizeStarredChannel"
          :show-notified="prioritizeNotifiedChannel"
        />
      </NavigationContentContainer>
    </div>
    <NavigationContentContainer subtitle="チャンネル" :class="$style.item">
      <ChannelTree
        v-if="topLevelChannels.length > 0"
        :channels="topLevelChannels"
      />
      <EmptyState v-else> 購読していません </EmptyState>
    </NavigationContentContainer>
    <NavigationContentContainer
      v-if="qallingChannels.length > 0"
      subtitle="Qall中チャンネル"
      :class="$style.item"
    >
      <ChannelList :channels-or-clip-folders="qallingChannels" />
    </NavigationContentContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRaw } from 'vue'

import ChannelList from '/@/components/Main/NavigationBar/ChannelList/ChannelList.vue'
import ChannelTree from '/@/components/Main/NavigationBar/ChannelList/ChannelTree.vue'
import DMChannelList from '/@/components/Main/NavigationBar/DMChannelList/DMChannelList.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import { useQall } from '/@/composables/qall/useQall'
import useChannelsWithNotification from '/@/composables/subscription/useChannelsWithNotification'
import { filterTrees } from '/@/lib/basic/tree'
import { constructTreeFromIds } from '/@/lib/channelTree'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'

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
  // filterTreesは重いのと内部ではreactiveである必要がないのでtoRawする
  filterTrees(toRaw(homeChannelTree.value.children), node => !node.archived)
)

const qallingChannels = computed(() =>
  roomWithParticipants.value.map(room => room.channel)
)
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
