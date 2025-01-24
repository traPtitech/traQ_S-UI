<template>
  <div>
    <navigation-content-container
      v-if="homeChannelWithTree.length > 0"
      subtitle="ホームチャンネル"
      :class="$style.item"
    >
      <channel-tree :channels="homeChannelWithTree" show-shortened-path />
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
      <channel-list :channels="channelsWithNotification" />
    </navigation-content-container>
    <navigation-content-container subtitle="チャンネル" :class="$style.item">
      <channel-tree
        v-if="topLevelChannels.length > 0"
        :channels="topLevelChannels"
      />
      <empty-state v-else>購読していません</empty-state>
    </navigation-content-container>
    <navigation-content-container
      v-if="qallingChannels.length > 0"
      subtitle="Qall中チャンネル"
      :class="$style.item"
    >
      <channel-list :channels="qallingChannels" />
    </navigation-content-container>
  </div>
</template>

<script lang="ts" setup>
import EmptyState from '/@/components/UI/EmptyState.vue'
import ChannelList from '/@/components/Main/NavigationBar/ChannelList/ChannelList.vue'
import ChannelTree from '/@/components/Main/NavigationBar/ChannelList/ChannelTree.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import DMChannelList from '/@/components/Main/NavigationBar/DMChannelList/DMChannelList.vue'
import { computed, toRaw } from 'vue'
import { constructTreeFromIds } from '/@/lib/channelTree'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import useChannelsWithNotification from '/@/composables/subscription/useChannelsWithNotification'
import { filterTrees } from '/@/lib/basic/tree'
import { useQall } from '/@/composables/qall/useQall'

const { homeChannelTree } = useChannelTree()
const { detail } = useMeStore()
const { channelsMap } = useChannelsStore()
const { rooms: roomWithParticipants } = useQall()

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
