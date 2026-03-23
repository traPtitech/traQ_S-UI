<template>
  <slot v-if="ready" />
</template>

<script lang="ts" setup>
import { computedAsync } from '@vueuse/core'

import { defer } from '/@/lib/basic/timer'

const ready = computedAsync(() => defer(() => true))
</script>
