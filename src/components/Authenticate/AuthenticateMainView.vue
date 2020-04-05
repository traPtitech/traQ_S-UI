<template>
  <div :class="$style.container" :style="styles.container">
    <authenticate-modal>
      <login-form v-if="props.type === 'login'" />
      <registration-form v-if="props.type === 'registration'" />
    </authenticate-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import AuthenticateModal from './AuthenticateModal.vue'
import LoginForm from './LoginForm.vue'
import RegistrationForm from './RegistrationForm.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

type Props = {
  type: 'login' | 'password-reset' | 'registration'
}

export default defineComponent({
  name: 'AuthenticateMainView',
  components: {
    AuthenticateModal,
    LoginForm,
    RegistrationForm
  },
  props: {
    type: {
      type: String,
      default: 'login'
    }
  },
  setup(props: Props) {
    const styles = useStyles()

    return {
      props,
      styles
    }
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
