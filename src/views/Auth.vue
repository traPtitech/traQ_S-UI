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

export type PageType = 'login' | 'password-reset' | 'registration' | 'consent'

export default defineComponent({
  name: 'Auth',
  props: {
    type: {
      type: String as PropType<PageType>,
      default: 'login' as const
    }
  },
  components: {
    AuthenticateMainView
  },
  setup(props) {
    const state = reactive({
      show: false
    })
    onMounted(async () => {
      let isLoggedIn = false
      try {
        await store.dispatch.domain.me.fetchMe()
        isLoggedIn = true
      } catch {}

      const isConsent = props.type === 'consent'

      if ((isLoggedIn && isConsent) || (!isLoggedIn && !isConsent)) {
        state.show = true
      } else {
        location.href = '/'
      }
    })
    return { state }
  }
})
</script>
