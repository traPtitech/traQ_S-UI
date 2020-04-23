<template>
  <channel-sidebar-content title="閲覧者" @click="closeDetail">
    <template #content>
      <user-icon v-for="id in viewerIds" :key="id" :user-id="id" :size="40" />
    </template>
  </channel-sidebar-content>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '@/types/entity-ids'
import ChannelSidebarContent from './ChannelSidebarContent.vue'

export default defineComponent({
  name: 'ChannelSidebarViewerDetail',
  components: { UserIcon, ChannelSidebarContent },
  props: { viewerIds: { type: Array as PropType<UserId[]>, default: [] } },
  setup(_, context) {
    const closeDetail = () => {
      context.emit('close')
    }
    return { closeDetail }
  }
})
</script>
