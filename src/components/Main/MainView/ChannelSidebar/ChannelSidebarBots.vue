<template>
  <sidebar-content-container v-if="viewStates.length > 0" title="参加BOT">
    <channel-sidebar-member-icons :viewer-states="viewStates" />
  </sidebar-content-container>
</template>

<script lang="ts" setup>
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import { computed } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import useChannelBots from './composables/useChannelBots'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  channelId: ChannelId
}>()

const { usersMap } = useUsersStore()

const botUserIds = useChannelBots(props)
const viewStates = computed(
  () =>
    botUserIds.value
      ?.filter(id => usersMap.value.has(id))
      .map(id => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        user: usersMap.value.get(id)!,
        active: true
      })) ?? []
)
</script>

<style lang="scss" module></style>
