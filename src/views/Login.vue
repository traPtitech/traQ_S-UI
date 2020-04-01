<template>
  <authenticate-main-view type="login" />
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import AuthenticateMainView from '@/components/Authenticate/AuthenticateMainView.vue'

export default defineComponent({
  name: 'Login',
  components: {
    AuthenticateMainView
  },
  setup() {}
})
</script>
