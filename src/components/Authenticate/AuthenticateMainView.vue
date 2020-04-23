<template>
  <div :class="$style.container" :style="styles.container">
    <authenticate-modal>
      <login-form v-if="type === 'login'" />
      <registration-form v-if="type === 'registration'" />
      <consent-form v-if="type === 'consent'" />
    </authenticate-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import AuthenticateModal from './AuthenticateModal.vue'
import LoginForm from './LoginForm.vue'
import RegistrationForm from './RegistrationForm.vue'
import ConsentForm from './ConsentForm/ConsentForm.vue'
import { PageType } from '@/views/Auth.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

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
    }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
