<template>
  <authenticate-main-view v-if="state.show" :type="type" />
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  PropType,
  computed,
  watch,
  SetupContext
} from 'vue'
import store from '@/store'
import AuthenticateMainView from '@/components/Authenticate/AuthenticateMainView.vue'
import { RouteName } from '@/router'
import useRedirectParam from '@/components/Authenticate/use/redirectParam'
import { useRouter } from 'vue-router'

export type PageType = 'login' | 'password-reset' | 'registration' | 'consent'

const usePageSwitch = (props: { type: PageType }, context: SetupContext) => {
  const router = useRouter()
  const state = reactive({
    show: false
  })

  const isConsent = computed(() => props.type === 'consent')

  const updateState = async () => {
    let isLoggedIn = false
    try {
      await store.dispatch.domain.me.fetchMe()
      isLoggedIn = true
    } catch {}

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
      const { redirect } = useRedirectParam(context)
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
  setup(props, context) {
    const state = usePageSwitch(props, context)

    return { state }
  }
})
</script>
