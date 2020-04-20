<template>
  <section>
    <div>
      <h3>テーマ切り替え</h3>
      <form-radio
        label="ライトテーマ"
        v-model="state.type"
        input-value="light"
      />
      <form-radio
        label="ダークテーマ"
        v-model="state.type"
        input-value="dark"
      />
      <form-radio
        label="カスタムテーマ"
        v-model="state.type"
        input-value="custom"
      />
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
import FormRadio from '@/components/UI/FormRadio.vue'
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
    FormRadio,
    FormInput
  }
})
</script>

<style lang="scss" module></style>
