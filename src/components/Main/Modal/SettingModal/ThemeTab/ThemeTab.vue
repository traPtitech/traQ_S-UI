<template>
  <section :class="$style.container">
    <div>
      <h3>テーマ切り替え</h3>
      <label>
        <input type="radio" checked />
        ライトテーマ
      </label>
      <label>
        <input type="radio" disabled />
        ダークテーマ
      </label>
      <label>
        <input type="radio" disabled />
        カスタムテーマ
      </label>
    </div>
    <div>
      <h3>カスタムテーマ設定</h3>
      <p title="4/1には実装されるよ">実装予定</p>
    </div>
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
  overflow: hidden;
}
</style>
