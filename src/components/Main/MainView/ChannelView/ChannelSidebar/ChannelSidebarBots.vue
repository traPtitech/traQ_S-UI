<template>
  <SidebarContentContainer v-if="viewStates.length > 0" title="参加BOT">
    <ChannelSidebarMemberIcons :viewer-states="viewStates" />
  </SidebarContentContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import { isDefined } from '/@/lib/basic/array'
import { useUsersStore } from '/@/store/entities/users'
import type { ChannelId } from '/@/types/entity-ids'

import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import useChannelBots from './composables/useChannelBots'

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
