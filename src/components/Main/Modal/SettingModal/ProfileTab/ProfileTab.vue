<template>
  <section :class="$style.container">
    <p>アイコン</p>
    <p>表示名</p>
    <p>ひとこと</p>
    <p>Twitter</p>
    <p>パスワード変更へのリンク</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'ProfileTab',
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
