<template>
  <sidebar-content-container
    v-if="!state.isOpenDetail"
    large-padding
    clickable
    @toggle="toggle"
  >
    <user-icon-ellipsis-list
      direction="row"
      transition="fade-right"
      :user-ids="viewerIds"
      @click="toggle"
    />
  </sidebar-content-container>
  <channel-sidebar-viewers-detail
    v-else
    :viewer-ids="viewerIds"
    @toggle="toggle"
  />
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from 'vue'
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import ChannelSidebarViewersDetail from './ChannelSidebarViewersDetail.vue'
import { UserId } from '/@/types/entity-ids'

export default defineComponent({
  name: 'ChannelSidebarViewers',
  components: {
    UserIconEllipsisList,
    ChannelSidebarViewersDetail,
    SidebarContentContainer
  },
  props: {
    viewerIds: {
      type: Array as PropType<readonly UserId[]>,
      default: () => []
    }
  },
  setup() {
    const state = reactive({
      isOpenDetail: false
    })
    const toggle = () => {
      state.isOpenDetail = !state.isOpenDetail
    }
    return { state, toggle }
  }
})
</script>
