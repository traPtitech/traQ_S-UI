<template>
  <div :class="$style.container" :style="styles.container">
    <authenticate-modal>
      <login-form></login-form>
    </authenticate-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import AuthenticateModal from './AuthenticateModal.vue'
import LoginForm from './LoginForm.vue'

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
    LoginForm
  },
  setup() {
    const styles = useStyles()

    return {
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
