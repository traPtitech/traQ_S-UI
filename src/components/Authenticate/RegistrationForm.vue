<template>
  <div>
    <authenticate-header :class="$style.header" title="新規登録" />
    <authenticate-input
      label="traQ ID"
      v-model="loginState.name"
      :class="$style.item"
      autocomplete="username"
      autofocus
    />
    <authenticate-input
      label="表示名"
      v-model="loginState.name"
      :class="$style.item"
      autocomplete="nickname"
    />
    <authenticate-input
      label="パスワード"
      type="password"
      v-model="loginState.name"
      :class="$style.item"
      autocomplete="new-password"
      enterkeyhint="done"
    />
    <div :class="$style.error">
      <span v-if="loginState.error">{{ loginState.error }}</span>
    </div>
    <div :class="$style.buttons">
      <authenticate-button
        type="primary"
        label="アカウント作成"
        is-submit
        @click="login"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useLogin from './use/login'
import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButton from './AuthenticateButton.vue'

export default defineComponent({
  name: 'RegistrationForm',
  components: {
    AuthenticateInput,
    AuthenticateHeader,
    AuthenticateButton
  },
  setup(_, context) {
    const { loginState, login, loginExternal } = useLogin()
    return { loginState, login, loginExternal }
  }
})
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
  color: $theme-accent-error;
}
</style>
