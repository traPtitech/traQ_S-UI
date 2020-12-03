<template>
  <transition name="zoom" appear>
    <!-- https://github.com/vuejs/rfcs/blob/master/active-rfcs/0017-transition-as-root.md -->
    <div v-if="show" :class="$style.container">
      <authenticate-modal>
        <login-form v-if="type === 'login'" />
        <registration-form v-if="type === 'registration'" />
        <consent-form v-if="type === 'consent'" />
      </authenticate-modal>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import AuthenticateModal from './AuthenticateModal.vue'
import LoginForm from './LoginForm.vue'
import RegistrationForm from './RegistrationForm.vue'
import ConsentForm from './ConsentForm/ConsentForm.vue'
import { PageType } from '@/views/Auth.vue'

export default defineComponent({
  name: 'AuthenticateMainView',
  components: {
    AuthenticateModal,
    LoginForm,
    RegistrationForm,
    ConsentForm
  },
  props: {
    type: {
      type: String as PropType<PageType>,
      default: 'login' as const
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: auto;
  padding: 48px 24px;
}
</style>
