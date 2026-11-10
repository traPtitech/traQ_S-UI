<template>
  <div
    :class="$style.container"
    :style="variables"
    :data-full-height="fullHeight"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { resolveTheme } from '/@/lib/theme/resolve'
import { getThemeVariables } from '/@/lib/theme/variables'

const props = defineProps<{
  theme: 'light' | 'dark'
  fullHeight: boolean
}>()

const variables = computed(() =>
  getThemeVariables(
    resolveTheme(
      props.theme === 'dark'
        ? window.defaultDarkTheme
        : window.defaultLightTheme
    )
  )
)
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-text-primary;
  min-width: 0;
  padding: 24px;
  color-scheme: var(--color-scheme);
  caret-color: var(--caret);

  &[data-full-height='true'] {
    min-height: 100vh;
  }
}
</style>
