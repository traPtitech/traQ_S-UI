<template>
  <sidebar-content-container-foldable title="Qall">
    <channel-sidebar-member-icons :viewer-states="viewStates" />
  </sidebar-content-container-foldable>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/vuex'
import SidebarContentContainerFoldable from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import { ChannelId } from '/@/types/entity-ids'

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
      props.qallUserIds
        .filter(id => store.state.entities.usersMap.has(id))
        .map(id => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          user: store.state.entities.usersMap.get(id)!,
          active: true
        }))
    )
    return { viewStates }
  }
})
</script>
