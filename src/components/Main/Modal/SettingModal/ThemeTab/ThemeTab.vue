<template>
  <section>
    <div :class="$style.element">
      <h3>テーマ切り替え</h3>
      <div :class="$style.content">
        <form-radio
          label="自動切替 (OSのテーマに合わせる)"
          v-model="state.type"
          input-value="auto"
          :class="$style.form"
        />
        <form-radio
          label="ライトテーマ"
          v-model="state.type"
          input-value="light"
          :class="$style.form"
        />
        <form-radio
          label="ダークテーマ"
          v-model="state.type"
          input-value="dark"
          :class="$style.form"
        />
        <form-radio
          label="カスタムテーマ"
          v-model="state.type"
          input-value="custom"
          :class="$style.form"
        />
      </div>
    </div>
    <div :class="$style.element">
      <h3>カスタムテーマ設定</h3>
      <div :class="$style.content">
        <template v-if="state.type === 'custom'">
          <div
            v-for="(val, category) in state.custom"
            :key="category"
            :class="$style.category"
          >
            <h4>{{ category }}</h4>
            <form-input
              v-for="(color, name) in val"
              :key="name"
              :label="name"
              v-model="val[name]"
              use-change-event
              :class="$style.input"
            />
          </div>
        </template>
        <p v-else>カスタムテーマが選択されていません</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
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

<style lang="scss" module>
h3 {
  margin-bottom: 8px;
}
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}
.form {
  margin-right: 12px;
}
.category {
  margin-bottom: 24px;
  .input {
    margin : {
      left: 12px;
      bottom: 8px;
    }
  }
}
</style>
