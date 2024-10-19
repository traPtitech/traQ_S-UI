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
      @toggle="toggle"
    />
  </sidebar-content-container>
  <channel-sidebar-viewers-detail
    v-else
    :viewer-ids="viewerIds"
    @toggle="toggle"
  />
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue'
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import ChannelSidebarViewersDetail from './ChannelSidebarViewersDetail.vue'
import type { UserId } from '/@/types/entity-ids'
import useToggle from '/@/composables/utils/useToggle'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'

const props = withDefaults(
  defineProps<{
    viewerIds?: readonly UserId[]
    modelValue: boolean
  }>(),
  {
    viewerIds: () => []
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const {
  value: isDetailOpen,
  toggle,
  close
} = useToggle(useModelValueSyncer(props, emit))

onUnmounted(() => close())
</script>
