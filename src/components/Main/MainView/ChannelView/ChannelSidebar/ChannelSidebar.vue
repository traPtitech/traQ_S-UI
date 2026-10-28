<template>
  <ChannelInfomationSidebar v-bind="props" />
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import type { ChannelId, UserId } from '/@/types/entity-ids'

import ChannelInfomationSidebar from './ChannelInfomationSidebar/ChannelInfomationSidebar.vue'

const props = defineProps<{
  channelId: ChannelId
  isSidebarOpenerReady: boolean
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()
</script>
