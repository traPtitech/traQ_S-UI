<template>
  <section>
    <div :class="$style.element">
      <h3 :class="$style.header">テーマ切り替え</h3>
      <div :class="$style.content">
        <form-radio
          v-model="state.type"
          label="OS準拠"
          input-value="auto"
          :class="$style.form"
        />
        <form-radio
          v-model="state.type"
          label="ライト"
          input-value="light"
          :class="$style.form"
        />
        <form-radio
          v-model="state.type"
          label="ダーク"
          input-value="dark"
          :class="$style.form"
        />
        <form-radio
          v-model="state.type"
          label="カスタム"
          input-value="custom"
          :class="$style.form"
        />
      </div>
    </div>
    <div :class="$style.element">
      <h3 :class="$style.header">カスタムテーマ</h3>
      <div :class="$style.content">
        <template v-if="state.type === 'custom'">
          <edit-theme :custom="state.custom" @change-theme="changeTheme" />
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
import type { Theme } from '/@/lib/theme/schema'
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
  position: relative;
}
.content {
  margin-left: 0px;
}
.form {
  margin-right: 12px;
  display: block;
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
