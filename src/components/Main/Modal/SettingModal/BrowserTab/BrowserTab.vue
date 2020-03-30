<template>
  <section :class="$style.container">
    <p>ログアウトボタン</p>
    <p>全セッション破棄ボタン</p>
    <p>通知状態表示</p>
    <p>起動時チャンネル設定</p>
    <p>メッセージ送信スタイル</p>
    <p>省エネモード</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'BrowserTab',
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
