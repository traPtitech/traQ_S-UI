<template>
  <section :class="$style.container">
    <p>色設定…？</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'ThemeTab',
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 16px;
  overflow: hidden;
}
</style>
