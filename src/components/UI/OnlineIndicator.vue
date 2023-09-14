<template>
  <div :class="$style.container">
    <indicator-dot
      :class="$style.dot"
      :data-is-online="$boolAttr(isOnline)"
      :size="size"
      :border-width="borderWidth"
    />
    <span v-if="hasText">{{ statusText }}</span>
  </div>
</template>

<script lang="ts" setup>
import IndicatorDot from './IndicatorDot.vue'
import { computed } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useOnlineUsers } from '/@/store/domain/onlineUsers'

const props = withDefaults(
  defineProps<{
    userId: UserId
    size?: number
    borderWidth?: number
    hasText?: boolean
  }>(),
  {
    size: 12,
    borderWidth: 2,
    hasText: false
  }
)

const { onlineUsers, fetchOnlineUsers } = useOnlineUsers()

fetchOnlineUsers()
const isOnline = computed(() => onlineUsers.value.has(props.userId))

const statusText = computed(() =>
  isOnline.value ? 'オンライン' : 'オフライン'
)
</script>

<style lang="scss" module>
.container {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}
.dot {
  display: inline-block;
  border-color: $theme-ui-secondary-inactive;
  vertical-align: middle;

  &[data-is-online] {
    background: $theme-accent-online-default;
    border-color: transparent;
  }
}
</style>
