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
        <input type="radio" v-model="state.type" value="custom" />
        カスタムテーマ
      </label>
    </div>
    <div>
      <h3>カスタムテーマ設定</h3>
      <template v-if="state.type === 'custom'">
        <div v-for="(val, category) in state.custom" :key="category">
          <h4>{{ category }}</h4>
          <form-input
            v-for="(color, name) in val"
            :key="name"
            :label="name"
            v-model="val[name]"
            use-change-event
          />
        </div>
      </template>
      <p v-else>カスタムテーマが選択されていません</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import useSyncedState from '../use/syncedState'
import FormInput from '@/components/UI/FormInput.vue'

export default defineComponent({
  name: 'ThemeTab',
  setup() {
    const browserSettings = computed(() => store.state.app.themeSettings)
    const { state } = useSyncedState(
      browserSettings,
      store.commit.app.themeSettings.set
    )

    // TODO: 色のバリデーション
    // TODO: カラーピッカー

    return { state }
  },
  components: {
    FormInput
  }
})
</script>

<style lang="scss" module></style>
