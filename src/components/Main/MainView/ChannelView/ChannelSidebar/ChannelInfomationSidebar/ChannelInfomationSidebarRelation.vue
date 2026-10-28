<template>
  <SidebarContentContainerFoldable title="関連チャンネル">
    <ChannelInfomationSidebarRelationContent
      :parent="parent"
      :children="children"
      :siblings="siblings"
      :current="current"
    />
  </SidebarContentContainerFoldable>
</template>

<script lang="ts" setup>
import SidebarContentContainerFoldable from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerFoldable.vue'
import useRelatedChannels from '/@/composables/useRelatedChannels'
import type { ChannelId } from '/@/types/entity-ids'

import ChannelInfomationSidebarRelationContent from './ChannelInfomationSidebarRelationContent.vue'

const props = defineProps<{
  channelId: ChannelId
}>()

const { current, parent, siblings, children } = useRelatedChannels(props)
</script>
