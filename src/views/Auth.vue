<template>
  <authenticate-main-view v-if="state.show" :type="props.type" />
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from '@vue/composition-api'
import store from '@/store'
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
    const state = reactive({
      show: false
    })
    onMounted(async () => {
      try {
        await store.dispatch.domain.me.fetchMe()
        location.href = '/'
      } catch {
        state.show = true
      }
    })
    return { props, state }
  }
})
</script>
