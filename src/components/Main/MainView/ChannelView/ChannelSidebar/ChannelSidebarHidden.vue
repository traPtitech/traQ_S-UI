<template>
  <div :class="$style.container">
    <a-icon
      :class="$style.icon"
      mdi
      name="chevron-double"
      :size="28"
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
import AIcon from '/@/components/UI/AIcon.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import type { UserId } from '/@/types/entity-ids'

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

.icon {
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
