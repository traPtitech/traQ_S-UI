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

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButton from './AuthenticateButton.vue'
import apis from '/@/lib/apis'

const useRegister = () => {
  const router = useRouter()
  const registerState = reactive({
    name: '',
    password: ''
  })
  const error = ref('')

  const register = async () => {
    try {
      await apis.createUser(registerState)
      await apis.login(undefined, registerState)

      router.push('/')
    } catch (e) {
      error.value = '' + e
    }
  }

  return { registerState, error, register }
}

export default defineComponent({
  name: 'RegistrationForm',
  components: {
    AuthenticateInput,
    AuthenticateHeader,
    AuthenticateButton
  },
  setup() {
    const { registerState, error, register } = useRegister()
    return { registerState, error, register }
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
  color: $theme-accent-error-default;
}
</style>
