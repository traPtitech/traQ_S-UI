<template>
  <section>
    <div :class="$style.element">
      <h3 :class="$style.header">テーマ切り替え</h3>
      <div :class="$style.content">
        <form-radio
          v-model="state.type"
          label="自動切替 (OSのテーマに合わせる)"
          input-value="auto"
          :class="$style.form"
        />
        <form-radio
          v-model="state.type"
          label="ライトテーマ"
          input-value="light"
          :class="$style.form"
        />
        <form-radio
          v-model="state.type"
          label="ダークテーマ"
          input-value="dark"
          :class="$style.form"
        />
        <form-radio
          v-model="state.type"
          label="カスタムテーマ"
          input-value="custom"
          :class="$style.form"
        />
      </div>
    </div>
    <div :class="$style.element">
      <h3 :class="$style.header">カスタムテーマ設定</h3>
      <div :class="$style.content">
        <template v-if="state.type === 'custom'">
          <div :class="$style.setting">
            <div
              v-for="(val, category) in state.custom.basic"
              :key="category"
              :class="$style.category"
            >
              <h4 class>{{ category }}</h4>
              <div
                v-for="(color, name) in val"
                :key="name"
                :class="$style.color"
              >
                <p :class="$style.name">{{ name }}</p>
                <!-- eslint-disable vue/valid-v-model -->
                <!-- TODO: 自動適用じゃなくてバリデーションしてから適用するようにする -->
                <form-input
                  v-model="(val[name as keyof typeof val] as string)"
                  use-change-event
                  on-secondary
                  :class="$style.input"
                />
                <!-- eslint-enable vue/valid-v-model -->
              </div>
            </div>
          </div>
          <edit-theme :custom="state.custom" @change-theme="changeTheme" />
        </template>
        <p v-else>カスタムテーマが選択されていません</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import EditTheme from '/@/components/Settings/ThemeTab/EditTheme.vue'
import FormRadio from '/@/components/UI/FormRadio.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import { reactive } from 'vue'
import { Theme } from '/@/lib/theme/schema'
import { useThemeSettings } from '/@/store/app/themeSettings'

const state = reactive(useThemeSettings())
const changeTheme = (theme: Theme) => {
  state.custom = theme
}
</script>

<style lang="scss" module>
.header {
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
.setting {
  @include background-secondary;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  padding: 12px;
  grid-gap: 16px;
}
.category {
  .color {
    display: flex;
    margin: 4px 0;
  }
  .name {
    @include color-ui-secondary;
    margin-right: 8px;
  }
  .input {
    margin-left: auto;
  }
}
</style>
