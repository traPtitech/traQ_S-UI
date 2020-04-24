<template>
  <sidebar-content-container clickable title="閲覧者" @click="closeDetail">
    <user-icon v-for="id in viewerIds" :key="id" :user-id="id" :size="40" />
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '@/types/entity-ids'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'

export default defineComponent({
  name: 'ChannelSidebarViewerDetail',
  components: { UserIcon, SidebarContentContainer },
  props: { viewerIds: { type: Array as PropType<UserId[]>, default: [] } },
  setup(_, context) {
    const closeDetail = () => {
      context.emit('close')
    }
    return { closeDetail }
  }
})
</script>
