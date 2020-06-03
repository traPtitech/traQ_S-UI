<template>
  <div :class="$style.container">traQ {{ version }}</div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import version from '@/lib/env/version'

export default defineComponent({
  name: 'Version',
  setup() {
    return { version }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  width: 100%;
  text-align: center;
}
</style>
