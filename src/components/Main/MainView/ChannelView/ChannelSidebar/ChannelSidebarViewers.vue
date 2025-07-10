<template>
  <sidebar-content-container
    v-if="!isDetailOpen"
    large-padding
    clickable
    @toggle="toggle"
  >
    <user-icon-ellipsis-list
      direction="row"
      transition="fade-right"
      :user-ids="viewerIds"
      :inactive-user-ids="inactiveViewerIds"
      @toggle="toggle"
    />
  </sidebar-content-container>
  <channel-sidebar-viewers-detail
    v-else
    :viewer-ids="viewerIds"
    :inactive-viewer-ids="inactiveViewerIds"
    @toggle="toggle"
  />
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue'
import ChannelSidebarViewersDetail from './ChannelSidebarViewersDetail.vue'
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import useToggle from '/@/composables/utils/useToggle'
import type { UserId } from '/@/types/entity-ids'

const modelValue = defineModel<boolean>({ required: true })

withDefaults(
  defineProps<{
    viewerIds?: readonly UserId[]
    inactiveViewerIds?: readonly UserId[]
  }>(),
  {
    viewerIds: () => []
  }
)

const { value: isDetailOpen, toggle, close } = useToggle(modelValue)

onUnmounted(() => close())
</script>
