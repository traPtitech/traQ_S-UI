<template>
  <authenticate-main-view :type="props.type" />
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import AuthenticateMainView from '@/components/Authenticate/AuthenticateMainView.vue'

type Props = {
  type: 'login' | 'password-reset' | 'registration'
}

export default defineComponent({
  name: 'Auth',
  props: {
    type: {
      type: String,
      default: 'login'
    }
  },
  components: {
    AuthenticateMainView
  },
  setup(props: Props) {
    return { props }
  }
})
</script>
