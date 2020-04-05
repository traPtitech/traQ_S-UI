<template>
  <section :class="$style.container">
    <p>RTC機能の有効化</p>
    <p>入力デバイス</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'QallTab',
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
