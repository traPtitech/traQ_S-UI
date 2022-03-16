<template>
  <sidebar-content-container-foldable title="関連チャンネル">
    <channel-sidebar-relation-content
      :parent="parent"
      :children="children"
      :siblings="siblings"
      :current="current"
    />
  </sidebar-content-container-foldable>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { ChannelId } from '/@/types/entity-ids'
import SidebarContentContainerFoldable from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ChannelSidebarRelationContent from './ChannelSidebarRelationContent.vue'
import useRelatedChannels from './composables/useRelatedChannels'

export default defineComponent({
  name: 'ChannelSidebarRelation',
  components: {
    SidebarContentContainerFoldable,
    ChannelSidebarRelationContent
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  setup(props) {
    const { current, parent, siblings, children } = useRelatedChannels(props)
    return { parent, current, children, siblings }
  }
})
</script>
