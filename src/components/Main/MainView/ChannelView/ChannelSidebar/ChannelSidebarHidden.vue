<template>
  <div :class="$style.container">
    <icon-button
      :class="$style.iconButton"
      :size="28"
      icon-mdi
      icon-name="chevron-double"
      @click="emit('open')"
    />
    <user-icon-ellipsis-list
      direction="col"
      transition="fade-bottom"
      count-clickable
      show-count
      :user-ids="viewerIds"
      :class="$style.rest"
      @count-click="emit('openViewers')"
    />
  </div>
</template>

<script lang="ts" setup>
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import type { UserId } from '/@/types/entity-ids'
import iconButton from '/@/components/UI/IconButton.vue'

withDefaults(
  defineProps<{
    viewerIds?: readonly UserId[]
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
.container {
  @include color-ui-primary;
  display: flex;
  flex-direction: column;
  width: 56px;
  height: 100%;
  align-items: center;
}

.iconButton {
  display: flex;
  margin-bottom: 16px;
  margin-top: 16px;
  cursor: pointer;
  pointer-events: all;
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.1);
  }
}
.rest {
  @include color-ui-secondary;
  pointer-events: all;
}
</style>
