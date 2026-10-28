<template>
  <PrimaryViewSidebarHidden @open="emit('open')">
    <UserIconEllipsisList
      direction="col"
      transition="fade-bottom"
      count-clickable
      show-count
      :user-ids="viewerIds"
      :inactive-user-ids="inactiveViewerIds"
      :class="$style.rest"
      @count-click="emit('openViewers')"
    />
  </PrimaryViewSidebarHidden>
</template>

<script lang="ts" setup>
import PrimaryViewSidebarHidden from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarHidden.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import type { UserId } from '/@/types/entity-ids'

withDefaults(
  defineProps<{
    viewerIds?: readonly UserId[]
    inactiveViewerIds?: readonly UserId[]
  }>(),
  {
    viewerIds: () => []
  }
)

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'openViewers'): void
}>()
</script>

<style lang="scss" module>
.rest {
  @include color-ui-secondary;
  pointer-events: all;
}
</style>
