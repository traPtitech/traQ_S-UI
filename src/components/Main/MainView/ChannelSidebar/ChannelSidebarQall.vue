<template>
  <sidebar-content-container-foldable title="Qall">
    <channel-sidebar-member-icons :viewer-states="viewStates" />
  </sidebar-content-container-foldable>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import store from '@/store'
import SidebarContentContainerFoldable from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import { ChannelId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ChannelSidebarQall',
  components: {
    SidebarContentContainerFoldable,
    ChannelSidebarMemberIcons
  },
  props: {
    qallUserIds: {
      type: Array as PropType<ChannelId[]>,
      required: true
    }
  },
  setup(props) {
    const viewStates = computed(() =>
      props.qallUserIds.map(id => ({
        user: store.state.entities.users[id],
        active: true
      }))
    )
    return { viewStates }
  }
})
</script>
