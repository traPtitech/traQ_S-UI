<template>
  <div>
    <navigation-content-container
      v-if="homeChannelWithTree.length > 0"
      subtitle="ホームチャンネル"
      :class="$style.item"
    >
      <channel-list :channels="homeChannelWithTree" show-shortened-path />
    </navigation-content-container>
    <navigation-content-container
      v-if="
        dmChannelsWithNotification.length + channelsWithNotification.length !==
        0
      "
      subtitle="未読"
      :class="$style.item"
    >
      <d-m-channel-list :dm-channels="dmChannelsWithNotification" />
      <channel-list
        :channels="channelsWithNotification"
        ignore-children
        show-shortened-path
      />
    </navigation-content-container>
    <navigation-content-container subtitle="チャンネル" :class="$style.item">
      <channel-list
        v-if="topLevelChannels.length > 0"
        :channels="topLevelChannels"
      />
      <empty-state v-else>購読していません</empty-state>
    </navigation-content-container>
    <navigation-content-container
      v-if="channelsWithRtc.length > 0"
      subtitle="Qall中チャンネル"
      :class="$style.item"
    >
      <channel-list
        :channels="channelsWithRtc"
        ignore-children
        show-shortened-path
      />
    </navigation-content-container>
  </div>
</template>

<script lang="ts" setup>
import EmptyState from '/@/components/UI/EmptyState.vue'
import ChannelList from '/@/components/Main/NavigationBar/ChannelList/ChannelList.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import DMChannelList from '/@/components/Main/NavigationBar/DMChannelList/DMChannelList.vue'
import { computed } from 'vue'
import { isDefined } from '/@/lib/basic/array'
import { constructTreeFromIds } from '/@/lib/channelTree'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import useChannelsWithNotification from '/@/composables/unreads/useChannelsWithNotification'
import { filterTrees } from '/@/lib/basic/tree'

const { homeChannelTree } = useChannelTree()
const { channelSessionsMap } = useDomainRtcStore()
const { detail } = useMeStore()
const { channelsMap } = useChannelsStore()

const homeChannelWithTree = computed(() => {
  if (!detail.value?.homeChannel) return []

  const trees = constructTreeFromIds(
    [detail.value.homeChannel],
    channelsMap.value
  )
  return filterTrees(trees, channel => !channel.archived)
})

const { channelsWithNotification, dmChannelsWithNotification } =
  useChannelsWithNotification()

const topLevelChannels = computed(() =>
  filterTrees(homeChannelTree.value.children, node => !node.archived)
)
const channelsWithRtc = computed(() =>
  [...channelSessionsMap.value.entries()]
    .filter(([, sessionIds]) => sessionIds.size > 0)
    .map(([channelId]) => channelsMap.value.get(channelId))
    .filter(isDefined)
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
