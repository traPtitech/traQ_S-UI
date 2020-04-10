<template>
  <authenticate-main-view v-if="state.show" :type="type" />
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import AuthenticateMainView from '@/components/Authenticate/AuthenticateMainView.vue'

export default defineComponent({
  name: 'Auth',
  props: {
    type: {
      type: String as PropType<'login' | 'password-reset' | 'registration'>,
      default: 'login' as const
    }
  },
  components: {
    AuthenticateMainView
  },
  setup() {
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
    return { state }
  }
})
</script>
