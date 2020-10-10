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
          <div :class="$style.content">
            <form-radio
              label="フォーム入力"
              v-model="customForm"
              input-value="form"
              :class="$style.form"
            />
            <form-radio
              label="json形式"
              v-model="customForm"
              input-value="json"
              :class="$style.form"
            />
          </div>
          <template v-if="customForm === 'form'">
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
          <p v-else>
            <textarea-autosize
              @input="val => (state.custom = jsonUpdate(val.target.value))"
              :value="JSON.stringify(state.custom, null, '\t')"
              :class="$style.jsonarea"
            />
          </p>
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
  data() {
    return {
      customForm: 'form'
    }
  },
  setup() {
    const browserSettings = computed(() => store.state.app.themeSettings)
    const { state } = useSyncedState(
      browserSettings,
      store.commit.app.themeSettings.set
    )

    // TODO: カラーピッカー
    return { state }
  },
  methods: {
    jsonUpdate(data: string) {
      try {
        return JSON.parse(data)
      } catch (err) {
        return this.state.custom
      }
    }
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

.jsonarea {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  width: 100%;
  margin-top: 12px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }
  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}
</style>
