<template>
  <transition name="zoom" appear>
    <!-- https://github.com/vuejs/rfcs/blob/master/active-rfcs/0017-transition-as-root.md -->
    <div v-if="shouldShow" :class="$style.container">
      <AuthenticateModal>
        <LoginForm
          v-if="type === 'login'"
          :external-login="externalLogin"
          :sign-up-allowed="signUpAllowed"
        />
        <RegistrationForm v-if="type === 'registration'" />
        <ConsentForm v-if="type === 'consent'" />
      </AuthenticateModal>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import AuthenticateModal from './AuthenticateModal.vue'
import LoginForm from './LoginForm.vue'
import RegistrationForm from './RegistrationForm.vue'
import ConsentForm from './ConsentForm/ConsentForm.vue'
import { computed } from 'vue'
import type { PageType } from '/@/views/AuthPage.vue'
import useVersion from '/@/composables/useVersion'
import { RouteName } from '/@/router'

const props = withDefaults(
  defineProps<{
    type?: PageType
    show?: boolean
  }>(),
  {
    type: RouteName.Login,
    show: false
  }
)

const needVersionFetch = computed(
  () => props.type === 'login' || props.type === 'registration'
)
// ログイン画面が表示されるときにlayout shiftが起こらないように取得後に表示する
const { externalLogin, signUpAllowed } = useVersion(needVersionFetch)

const shouldShow = computed(
  () =>
    props.show &&
    ((props.type === 'login' && externalLogin.value) ||
      (props.type === 'registration' && signUpAllowed.value) ||
      props.type === 'consent')
)
</script>

<style lang="scss" module>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: auto;
  padding: 48px 24px;
  scrollbar-gutter: stable;
}
</style>
