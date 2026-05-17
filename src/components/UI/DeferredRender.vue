<template>
  <slot v-if="disabled || ready" />
</template>

<script lang="ts" setup>
import { computedAsync } from '@vueuse/core'

import { defer } from '/@/lib/basic/timer'

withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const ready = computedAsync(() => defer(() => true))
</script>
