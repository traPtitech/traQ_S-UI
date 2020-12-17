<template>
  <div>
    <navigation-content-container
      v-if="homeChannel"
      subtitle="ホームチャンネル"
      :class="$style.item"
    >
      <channel-list
        :channels="[homeChannel]"
        ignore-children
        show-shortened-path
      />
    </navigation-content-container>
    <navigation-content-container
      v-if="channelsWithNotification.length !== 0"
      subtitle="未読"
      :class="$style.item"
    >
      <channel-list
        :channels="channelsWithNotification"
        ignore-children
        show-shortened-path
      />
    </navigation-content-container>
    <navigation-content-container subtitle="チャンネル" :class="$style.item">
      <channel-list
        v-if="topLevelChannels.length !== 0"
        :channels="topLevelChannels"
      />
      <empty-state v-else>購読していません</empty-state>
    </navigation-content-container>
    <navigation-content-container
      v-if="channelsWithRtc.length !== 0"
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

<script lang="ts">
import { defineComponent, computed } from 'vue'
import _store from '@/_store'
import store from '@/store'
import EmptyState from '@/components/UI/EmptyState.vue'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'
import { isDefined } from '@/lib/util/array'

export default defineComponent({
  name: 'Home',
  components: {
    ChannelList,
    EmptyState,
    NavigationContentContainer
  },
  setup() {
    const homeChannel = computed(() =>
      store.state.entities.channelsMap.get(
        _store.state.domain.me.detail?.homeChannel ?? ''
      )
    )
    const channelsWithNotification = computed(() =>
      Object.values(_store.state.domain.me.unreadChannelsSet)
        .map(unread => store.state.entities.channelsMap.get(unread.channelId))
        .filter(isDefined)
    )
    const topLevelChannels = computed(
      () =>
        _store.state.domain.channelTree.homeChannelTree.children.filter(
          channel => !channel.archived
        ) ?? []
    )
    const channelsWithRtc = computed(() =>
      Object.entries(_store.state.app.rtc.channelSessionsMap)
        .filter(([, sessionIds]) => sessionIds && sessionIds.length > 0)
        .map(([channelId]) => store.state.entities.channelsMap.get(channelId))
        .filter(isDefined)
    )

    return {
      homeChannel,
      topLevelChannels,
      channelsWithNotification,
      channelsWithRtc
    }
  }
})
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
