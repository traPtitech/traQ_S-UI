<template>
  <!-- Enterキーでログインするため -->
  <form @submit.prevent="login">
    <authenticate-header :class="$style.header" />
    <authenticate-input
      label="traQ ID"
      v-model="loginState.name"
      autocomplete="username"
      :class="$style.item"
      autofocus
    />
    <span :class="$style.item">
      <authenticate-input
        label="パスワード"
        type="password"
        v-model="loginState.pass"
        autocomplete="current-password"
        enterkeyhint="done"
      />
      <a
        v-if="resetLink !== undefined"
        :href="resetLink"
        :class="$style.forgotPassword"
      >
        パスワードを忘れた
      </a>
    </span>
    <div :class="$style.error">
      <span v-if="loginState.error">{{ loginState.error }}</span>
    </div>
    <div :class="$style.buttons">
      <authenticate-button type="primary" label="ログイン" is-submit />
    </div>
    <template v-if="!isIOS && externalLogin.length > 0">
      <authenticate-separator label="または" :class="$style.separator" />
      <div :class="$style.exLoginButtons">
        <authenticate-button
          type="secondary"
          :class="$style.exLoginButton"
          v-show="externalLogin.includes('traQ')"
          label="traP"
          icon-name="traQ"
          @click="loginExternal('traq')"
        />
        <authenticate-button
          type="secondary"
          :class="$style.exLoginButton"
          v-show="externalLogin.includes('google')"
          label="Google"
          icon-mdi
          icon-name="google"
          @click="loginExternal('google')"
        />
        <authenticate-button
          type="secondary"
          :class="$style.exLoginButton"
          v-show="externalLogin.includes('github')"
          label="GitHub"
          icon-mdi
          icon-name="github"
          @click="loginExternal('github')"
        />
        <authenticate-button
          type="secondary"
          :class="$style.exLoginButton"
          v-show="externalLogin.includes('oidc')"
          label="OpenID Connect"
          icon-mdi
          icon-name="openid"
          @click="loginExternal('oidc')"
        />
      </div>
    </template>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import useLogin from './use/login'
import store from '@/store'
import { isIOSApp } from '@/lib/util/browser'
import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButton from './AuthenticateButton.vue'
import AuthenticateSeparator from './AuthenticateSeparator.vue'
import config from '@/config'

export default defineComponent({
  name: 'LoginForm',
  components: {
    AuthenticateInput,
    AuthenticateHeader,
    AuthenticateButton,
    AuthenticateSeparator
  },
  setup(_, context) {
    const { loginState, login, loginExternal } = useLogin()
    const isIOS = isIOSApp()
    const { resetLink } = config.auth
    const externalLogin = computed(
      () => store.state.app.version.flags.externalLogin
    )

    return {
      resetLink,
      loginState,
      login,
      loginExternal,
      isIOS,
      externalLogin
    }
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
  font-weight: bold;
}
</style>
