<template>
  <authenticate-main-view :show="state.show" :type="type" />
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  PropType,
  computed,
  watch
} from 'vue'
import store from '@/_store'
import AuthenticateMainView from '@/components/Authenticate/AuthenticateMainView.vue'
import { RouteName } from '@/router'
import useRedirectParam from '@/components/Authenticate/use/redirectParam'
import { useRouter } from 'vue-router'

export type PageType = 'login' | 'password-reset' | 'registration' | 'consent'

const usePageSwitch = (props: { type: PageType }) => {
  const router = useRouter()
  const { redirect } = useRedirectParam()
  const state = reactive({
    show: false
  })

  const isConsent = computed(() => props.type === 'consent')

  const updateState = async () => {
    try {
      await store.dispatch.domain.me.fetchMe()
    } catch {}
    const isLoggedIn = store.getters.domain.me.isLoggedIn

    if (isConsent.value) {
      if (isLoggedIn) {
        state.show = true
        return
      }

      // OAuth認可画面に入る前にログインさせる
      // ログインしたら戻ってくる
      router.replace({
        name: RouteName.Login,
        query: { redirect: `${location.pathname}${location.search}` }
      })
      return
    }

    if (isLoggedIn) {
      redirect()
      return
    }

    state.show = true
  }

  onMounted(() => {
    updateState()
  })
  watch(
    () => props.type,
    () => {
      updateState()
    }
  )
  return state
}

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
    const state = usePageSwitch(props)

    return { state }
  }
})
</script>
