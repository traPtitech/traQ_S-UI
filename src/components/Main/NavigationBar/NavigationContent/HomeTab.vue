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

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '/@/vuex'
import EmptyState from '/@/components/UI/EmptyState.vue'
import ChannelList from '/@/components/Main/NavigationBar/ChannelList/ChannelList.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import { isDefined } from '/@/lib/basic/array'
import { constructTree } from '/@/lib/channelTree'
import DMChannelList from '/@/components/Main/NavigationBar/DMChannelList/DMChannelList.vue'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useDomainRtcStore } from '/@/store/domain/rtc'

export default defineComponent({
  name: 'HomeTab',
  components: {
    ChannelList,
    EmptyState,
    NavigationContentContainer,
    DMChannelList
  },
  setup() {
    const { homeChannelTree } = useChannelTree()
    const { channelSessionsMap } = useDomainRtcStore()

    const homeChannelWithTree = computed(() =>
      !store.state.domain.me.detail?.homeChannel
        ? []
        : constructTree(
            {
              id: '',
              name: '',
              parentId: null,
              archived: false,
              children: [store.state.domain.me.detail.homeChannel]
            },
            store.state.entities.channelsMap
          )?.children?.filter(channel => !channel.archived) ?? []
    )
    const channelsWithNotification = computed(() =>
      [...store.state.domain.me.unreadChannelsMap.values()]
        .sort((a, b) => {
          if (a.noticeable !== b.noticeable) {
            return b.noticeable ? 1 : -1
          }
          return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
        })
        .map(unread => store.state.entities.channelsMap.get(unread.channelId))
        .filter(isDefined)
    )
    const dmChannelsWithNotification = computed(() =>
      [...store.state.domain.me.unreadChannelsMap.values()]
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .map(unread => store.state.entities.dmChannelsMap.get(unread.channelId))
        .filter(isDefined)
    )
    const topLevelChannels = computed(() =>
      homeChannelTree.value.children.filter(channel => !channel.archived)
    )
    const channelsWithRtc = computed(() =>
      [...channelSessionsMap.value.entries()]
        .filter(([, sessionIds]) => sessionIds.size > 0)
        .map(([channelId]) => store.state.entities.channelsMap.get(channelId))
        .filter(isDefined)
    )

    return {
      homeChannelWithTree,
      topLevelChannels,
      channelsWithNotification,
      dmChannelsWithNotification,
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
