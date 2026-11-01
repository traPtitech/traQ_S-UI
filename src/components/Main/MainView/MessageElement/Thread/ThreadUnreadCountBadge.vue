<template>
  <span v-if="unreadCount > 0" :class="$style.container">
    <span :class="$style.indicator" aria-hidden="true" />
    <span :class="$style.count">{{ unreadCountString }}</span>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    unreadCount?: number
  }>(),
  {
    unreadCount: 0
  }
)

const unreadCountString = computed(() => {
  if (props.unreadCount > 99) return '99+'
  return `${props.unreadCount}`
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
}

.indicator {
  position: absolute;
  width: 6px;
  height: 6px;
  left: 18px;
  top: 0;
  border-radius: 50%;
  background: $theme-accent-notification-background;
  z-index: 1;
}

.count {
  @include size-body2;
  @include color-accent-primary;
  width: 24px;
  font-weight: 700;
  line-height: 21px;
  text-align: center;
}
</style>
