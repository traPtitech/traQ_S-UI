<template>
  <sidebar-content-container title="メンバー">
    <empty-state v-if="isForceNotification"> 強制通知チャンネル </empty-state>
    <empty-state v-else-if="!subscribers">
      メンバーの取得に失敗しました
    </empty-state>
    <channel-sidebar-member-icons
      v-else-if="subscribers.size > 0"
      :viewer-states="viewStates"
    />
    <empty-state v-else> メンバーはいません </empty-state>
  </sidebar-content-container>
</template>

<script lang="ts" setup>
import EmptyState from '/@/components/UI/EmptyState.vue'
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import { computed } from 'vue'
import type { ChannelId, UserId } from '/@/types/entity-ids'
import useChannelSubscribers from '/@/composables/subscription/useChannelSubscribers'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import { isDefined } from '/@/lib/basic/array'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId
    viewerIds?: readonly UserId[]
  }>(),
  {
    viewerIds: () => []
  }
)

const { channelsMap } = useChannelsStore()
const { activeUsersMap } = useUsersStore()

const subscribers = useChannelSubscribers(props)

const isForceNotification = computed(
  () => channelsMap.value.get(props.channelId)?.force
)
const viewStates = computed(() =>
  [...subscribers.value]
    .map(id => activeUsersMap.value.get(id))
    .filter(isDefined)
    .map(user => ({ ...user, inactive: !props.viewerIds.includes(user.id) }))
    .sort((a, b) => {
      if (a.inactive === b.inactive) {
        return 0
      }
      return a.inactive ? 1 : -1
    })
)
</script>

<style lang="scss" module></style>
