<template>
  <section>
    <div>
      <h3>テーマ切り替え</h3>
      <label>
        <input type="radio" v-model="state.type" value="light" />
        ライトテーマ
      </label>
      <label>
        <input type="radio" v-model="state.type" value="dark" />
        ダークテーマ
      </label>
      <label>
        <input type="radio" v-model="state.type" value="custom" disabled />
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
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import useSyncedState from '../use/syncedState'

export default defineComponent({
  name: 'ThemeTab',
  setup() {
    const browserSettings = computed(() => store.state.app.themeSettings)
    const { state } = useSyncedState(
      browserSettings,
      store.commit.app.themeSettings.set
    )

    return { state }
  }
})
</script>

<style lang="scss" module></style>
