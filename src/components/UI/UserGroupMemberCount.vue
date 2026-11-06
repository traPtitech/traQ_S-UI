<template>
  <span
    :class="$style.container"
    :data-background="background"
    :title="`管理者 ${adminCount} / メンバー ${memberCount}`"
  >
    <AIcon name="crown" mdi :size="16" />
    <span>{{ adminCount }}</span>
    <span :class="$style.separator">/</span>
    <AIcon name="user" :size="16" />
    <span>{{ memberCount }}</span>
  </span>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

type Background = 'secondary' | 'tertiary'
withDefaults(
  defineProps<{
    adminCount: number
    memberCount: number
    background?: Background
  }>(),
  {
    background: 'secondary'
  }
)
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  @include color-ui-secondary;
  @include size-body2;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
  padding: 0 5px 0 4px;
  border-radius: 4px;
  white-space: nowrap;
  &[data-background='tertiary'] {
    @include background-tertiary;
  }
}
.separator {
  margin: 0 1px 0 4px;
}
</style>
