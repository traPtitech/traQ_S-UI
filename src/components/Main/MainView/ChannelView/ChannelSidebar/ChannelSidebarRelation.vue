<template>
  <SidebarContentContainerFoldable title="関連チャンネル">
    <ChannelSidebarRelationContent
      :parent="parent"
      :children="children"
      :siblings="siblings"
      :current="current"
    />
  </SidebarContentContainerFoldable>
</template>

<script lang="ts" setup>
import SidebarContentContainerFoldable from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerFoldable.vue'
import ChannelSidebarRelationContent from './ChannelSidebarRelationContent.vue'
import type { ChannelId } from '/@/types/entity-ids'
import useRelatedChannels from '/@/composables/useRelatedChannels'

const props = defineProps<{
  channelId: ChannelId
}>()

const { current, parent, siblings, children } = useRelatedChannels(props)
</script>
