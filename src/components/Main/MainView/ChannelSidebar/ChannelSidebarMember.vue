<template>
  <sidebar-content-container title="メンバー">
    <empty-state v-if="isForceNotification">強制通知チャンネル</empty-state>
    <empty-state v-else-if="!subscribers">
      メンバーの取得に失敗しました
    </empty-state>
    <channel-sidebar-member-icons
      v-else-if="subscribers.size > 0"
      :viewer-states="viewStates"
    />
    <empty-state v-else>メンバーはいません</empty-state>
  </sidebar-content-container>
</template>

<script lang="ts" setup>
import EmptyState from '/@/components/UI/EmptyState.vue';
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue';
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue';
import { computed } from 'vue';
import { ChannelId, UserId } from '/@/types/entity-ids'
import useChannelSubscribers from '/@/composables/useChannelSubscribers'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'

const props = withDefaults(defineProps<{
    channelId: ChannelId,
    viewerIds?: readonly UserId[]
}>(), {
    viewerIds: () => []
});

const { channelsMap } = useChannelsStore()
const { usersMap, activeUsersMap } = useUsersStore()

const subscribers = useChannelSubscribers(props)

const isForceNotification = computed(
  () => channelsMap.value.get(props.channelId)?.force
)
const viewStates = computed(() =>
  [...(subscribers.value ?? new Set())]
    .filter(id => usersMap.value.has(id))
    .map(id => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user: activeUsersMap.value.get(id)!,
      active: props.viewerIds.includes(id)
    }))
    .filter(state => state.user !== undefined)
    .sort((a, b) => {
      if (a.active === b.active) {
        return 0
      }
      return a.active ? -1 : 1
    })
)
</script>

<style lang="scss" module></style>
