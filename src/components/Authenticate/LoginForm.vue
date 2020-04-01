<template>
  <div>
    <authenticate-header :class="$style.header" />
    <authenticate-input
      title="traQ ID"
      :text="loginState.name"
      @input="setName"
      :class="$style.item"
    />
    <span :class="$style.item">
      <authenticate-input
        title="パスワード"
        type="password"
        :text="loginState.pass"
        @input="setPass"
      />
      <router-link
        to="/forgot-password"
        :class="$style.forgotPassword"
        :style="styles.forgotPassword"
      >
        パスワードを忘れた
      </router-link>
    </span>
    <div :style="styles.error" :class="$style.error">
      <span v-if="loginState.error">{{ loginState.error }}</span>
    </div>
    <div :class="$style.buttons">
      <authenticate-button-primary label="ログイン" @click="login" />
    </div>
    <authenticate-separator label="または" :class="$style.separator" />
    <div :class="$style.exLoginButtons">
      <authenticate-button-secondary
        :class="$style.exLoginButton"
        label="traP"
        icon-name="traQ"
        @click="loginExternal('traq')"
      />
      <authenticate-button-secondary
        :class="$style.exLoginButton"
        label="Google"
        icon-mdi
        icon-name="google"
        @click="loginExternal('google')"
      />
      <authenticate-button-secondary
        :class="$style.exLoginButton"
        label="GitHub"
        icon-mdi
        icon-name="github"
        @click="loginExternal('github')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import useLogin from './use/login'
import { makeStyles } from '@/lib/styles'
import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButtonPrimary from './AuthenticateButtonPrimary.vue'
import AuthenticateButtonSecondary from './AuthenticateButtonSecondary.vue'
import AuthenticateSeparator from './AuthenticateSeparator.vue'

const useStyles = () =>
  reactive({
    forgotPassword: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    error: makeStyles(theme => ({
      color: theme.accent.error
    }))
  })

export default defineComponent({
  name: 'LoginForm',
  components: {
    AuthenticateInput,
    AuthenticateHeader,
    AuthenticateButtonPrimary,
    AuthenticateButtonSecondary,
    AuthenticateSeparator
  },
  setup() {
    const { loginState, login, loginExternal, setName, setPass } = useLogin()
    const styles = useStyles()
    return { loginState, styles, setName, setPass, login, loginExternal }
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
</style>
