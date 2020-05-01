<template>
  <div>
    <navigation-content-container
      v-if="homeChannel"
      subtitle="ホームチャンネル"
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
    >
      <channel-list
        :channels="channelsWithNotification"
        ignore-children
        show-shortened-path
      />
    </navigation-content-container>
    <navigation-content-container subtitle="チャンネル">
      <channel-list
        v-if="topLevelChannels.length !== 0"
        :channels="topLevelChannels"
      />
      <empty-state v-else>購読していません</empty-state>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import EmptyState from '@/components/UI/EmptyState.vue'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'

export default defineComponent({
  name: 'Home',
  components: {
    ChannelList,
    EmptyState,
    NavigationContentContainer
  },
  setup() {
    const homeChannel = computed(
      () =>
        store.state.entities.channels[
          store.state.domain.me.detail?.homeChannel ?? ''
        ]
    )
    const channelsWithNotification = computed(() =>
      Object.values(store.state.domain.me.unreadChannelsSet)
        .map(unread => store.state.entities.channels[unread.channelId ?? ''])
        .filter(c => !!c)
    )
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.homeChannelTree.children ?? []
    )

    return {
      homeChannel,
      topLevelChannels,
      channelsWithNotification
    }
  }
})
</script>

<style lang="scss" module></style>
