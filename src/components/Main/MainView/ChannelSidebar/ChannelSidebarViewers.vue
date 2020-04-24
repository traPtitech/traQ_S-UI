<template>
  <sidebar-content-container
    large-padding
    clickable
    v-if="!state.isOpenDetail"
    @click="toggle"
  >
    <user-icon-ellipsis-list
      direction="row"
      :user-ids="viewerIds"
      @click.native="toggle"
    />
  </sidebar-content-container>
  <channel-sidebar-viewers-detail
    v-else
    :viewer-ids="viewerIds"
    @close="toggle"
  />
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import UserIconEllipsisList from '@/components/UI/UserIconEllipsisList.vue'
import ChannelSidebarViewersDetail from './ChannelSidebarViewersDetail.vue'
import { UserId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ChannelSidebarViewers',
  components: {
    UserIconEllipsisList,
    ChannelSidebarViewersDetail,
    SidebarContentContainer
  },
  props: {
    viewerIds: { type: Array as PropType<UserId[]>, default: [] }
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
