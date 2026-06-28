<template>
  <span :class="[$style.indicator, { [$style.limitOver]: isLimitOver }]">
    {{ currentCount }} / {{ limit }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const { currentCount, limit } = defineProps<{
  currentCount: number
  limit: number
}>()

const isLimitOver = computed(() => {
  return currentCount > limit
})
</script>

<style lang="scss" module>
.indicator {
  @include color-ui-secondary;
  @include size-caption;
}

.limitOver {
  color: $theme-accent-error-default;
}
</style>
