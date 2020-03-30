<template>
  <section :class="$style.container">
    <p>スタンプ登録</p>
    <p>スタンプ編集</p>
    <p>スタンプパレット</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'StampTab',
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
