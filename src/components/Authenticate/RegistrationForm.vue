<template>
  <div>
    <authenticate-header :class="$style.header" title="新規登録" />
    <authenticate-input
      v-model="registerState.name"
      label="traQ ID"
      :class="$style.item"
      autocomplete="username"
      autofocus
    />
    <authenticate-input
      v-model="registerState.password"
      label="パスワード"
      type="password"
      :class="$style.item"
      autocomplete="new-password"
      enterkeyhint="done"
    />
    <div :class="$style.error">
      <span v-if="error">{{ error }}</span>
    </div>
    <div :class="$style.buttons">
      <authenticate-button
        type="primary"
        label="アカウント作成"
        is-submit
        @click="register"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButton from './AuthenticateButton.vue'
import useRegister from './composables/useRegister'

const { registerState, error, register } = useRegister()
</script>

<style lang="scss" module>
.item {
  margin: 24px 0;
  display: block;
}
.header {
  margin-bottom: 48px;
}
.forgotPassword {
  @include color-ui-secondary;
  @include size-caption;
  display: block;
  margin-top: 16px;
}
.buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 48px;
}
.separator {
  margin: 32px 0;
}
.exLoginButtons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 32px;
}
.exLoginButton {
  margin: 0 8px;
}
.error {
  color: $theme-accent-error-default;
}
</style>
