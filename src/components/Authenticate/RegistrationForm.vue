<template>
  <div>
    <authenticate-header :class="$style.header" title="新規登録" />
    <authenticate-input
      label="traQ ID"
      :text="loginState.name"
      :class="$style.item"
      @input="setName"
    />
    <authenticate-input
      label="表示名"
      :text="loginState.name"
      :class="$style.item"
      @input="setName"
    />
    <authenticate-input
      label="パスワード"
      type="password"
      :text="loginState.name"
      :class="$style.item"
      @input="setName"
    />
    <div :class="$style.error">
      <span v-if="loginState.error">{{ loginState.error }}</span>
    </div>
    <div :class="$style.buttons">
      <authenticate-button-primary label="アカウント作成" @click="login" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useLogin from './use/login'

import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButtonPrimary from './AuthenticateButtonPrimary.vue'

export default defineComponent({
  name: 'RegistrationForm',
  components: {
    AuthenticateInput,
    AuthenticateHeader,
    AuthenticateButtonPrimary
  },
  setup() {
    const { loginState, login, loginExternal, setName, setPass } = useLogin()
    return { loginState, setName, setPass, login, loginExternal }
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
  display: block;
  margin-top: 16px;
  font-size: 0.75rem;
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
