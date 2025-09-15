<template>
  <!-- Enterキーでログインするため -->
  <form @submit.prevent="login">
    <AuthenticateHeader :class="$style.header" />
    <LoginFormSaved
      v-if="saved"
      :saved="saved"
      :login-state="loginState"
      @login="loginWithSaved"
      @use-other="dontUseSaved"
    />
    <template v-else>
      <AuthenticateInput
        v-model="loginState.name"
        label="traQ ID"
        autocomplete="username"
        :class="$style.item"
        autofocus
      />
      <span :class="$style.item">
        <AuthenticateInput
          v-model="loginState.pass"
          label="パスワード"
          type="password"
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
        <AuthenticateButton type="primary" label="ログイン" is-submit />
      </div>
      <template v-if="externalLogin.size > 0">
        <AuthenticateSeparator label="または" :class="$style.separator" />
        <div :class="$style.exLoginButtons">
          <AuthenticateButton
            v-show="externalLogin.has('traQ')"
            type="secondary"
            :class="$style.exLoginButton"
            label="traP"
            icon-name="traQ"
            @click="loginExternal('traq')"
          />
          <AuthenticateButton
            v-show="externalLogin.has('google')"
            type="secondary"
            :class="$style.exLoginButton"
            label="Google"
            icon-mdi
            icon-name="google"
            @click="loginExternal('google')"
          />
          <AuthenticateButton
            v-show="externalLogin.has('github')"
            type="secondary"
            :class="$style.exLoginButton"
            label="GitHub"
            icon-mdi
            icon-name="github"
            @click="loginExternal('github')"
          />
          <AuthenticateButton
            v-show="externalLogin.has('oidc')"
            type="secondary"
            :class="$style.exLoginButton"
            label="OpenID Connect"
            icon-mdi
            icon-name="openid"
            @click="loginExternal('oidc')"
          />
          <AuthenticateButton
            v-show="externalLogin.has('slack')"
            type="secondary"
            :class="$style.exLoginButton"
            label="Slack"
            icon-mdi
            icon-name="slack"
            @click="loginExternal('slack')"
          />
        </div>
      </template>
      <template v-if="signUpAllowed">
        <AuthenticateSeparator :class="$style.separator" />
        <router-link to="/registration">
          <AuthenticateButton
            type="secondary"
            :class="$style.registrationButton"
            label="新規登録"
          />
        </router-link>
      </template>
    </template>
  </form>
</template>

<script lang="ts" setup>
import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButton from './AuthenticateButton.vue'
import AuthenticateSeparator from './AuthenticateSeparator.vue'
import LoginFormSaved from './LoginFormSaved.vue'
import useLogin from './composables/useLogin'

withDefaults(
  defineProps<{
    externalLogin: Set<string>
    signUpAllowed?: boolean
  }>(),
  {
    signUpAllowed: false
  }
)

const {
  loginState,
  saved,
  login,
  loginWithSaved,
  loginExternal,
  dontUseSaved
} = useLogin()
const resetLink = window.traQConfig.auth?.resetLink
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
  font-weight: bold;
}
.registrationButton {
  margin: 0 auto;
}
</style>
