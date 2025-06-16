<template>
  <sidebar-content-container v-if="viewStates.length > 0" title="参加BOT">
    <channel-sidebar-member-icons :viewer-states="viewStates" />
  </sidebar-content-container>
</template>

<script lang="ts" setup>
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import { computed } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import useChannelBots from './composables/useChannelBots'
import { useUsersStore } from '/@/store/entities/users'
import { isDefined } from '/@/lib/basic/array'

const props = defineProps<{
  channelId: ChannelId
}>()

const { usersMap } = useUsersStore()

const botUserIds = useChannelBots(props)
const viewStates = computed(
  () =>
    botUserIds.value?.map(id => usersMap.value.get(id)).filter(isDefined) ?? []
)
</script>

<style lang="scss" module></style>
