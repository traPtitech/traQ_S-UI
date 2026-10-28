<template>
  <ChannelThreadsSidebar :is-sidebar-opener-ready="isSidebarOpenerReady" />
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import type { ChannelId, UserId } from '/@/types/entity-ids'

import ChannelThreadsSidebar from './ChannelThreadsSidebar/ChannelThreadsSidebar.vue'

defineProps<{
  channelId: ChannelId
  isSidebarOpenerReady: boolean
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()
</script>
