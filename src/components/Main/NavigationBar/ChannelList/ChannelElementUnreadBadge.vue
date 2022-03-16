<template>
  <div
    v-if="unreadCount > 0"
    :class="$style.container"
    :data-is-noticeable="$boolAttr(isNoticeable)"
  >
    {{ unreadCountString }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    unreadCount?: number
    isNoticeable?: boolean
  }>(),
  {
    unreadCount: 0,
    isNoticeable: false
  }
)

const unreadCountString = computed(() => {
  if (props.unreadCount <= 0) return undefined
  if (props.unreadCount > 99) return '99+'
  return '' + props.unreadCount
})
</script>

<style lang="scss" module>
.container {
  color: var(--specific-channel-unread-badge-text);
  background: $theme-ui-secondary-background;
  padding: 0 4px;
  min-width: 24px;
  flex-shrink: 0;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  &[data-is-noticeable] {
    background: $theme-accent-notification-background;
  }
}
</style>
