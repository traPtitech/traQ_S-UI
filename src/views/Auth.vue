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
} from '@vue/composition-api'
import store from '@/store'
import AuthenticateMainView from '@/components/Authenticate/AuthenticateMainView.vue'
import { redirectToPipelineIfNeeded } from '@/router/pipeline'
import { RouteName } from '@/router'
import { getStringParam } from '@/lib/util/params'

export type PageType = 'login' | 'password-reset' | 'registration' | 'consent'

const usePageSwitch = (props: { type: PageType }, context: SetupContext) => {
  const state = reactive({
    show: false
  })

  const isConsent = computed(() => props.type === 'consent')

  onMounted(() => {
    watch(
      () => props.type,
      async () => {
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
          context.root.$router.replace({
            name: RouteName.Login,
            query: { redirect: `${location.pathname}${location.search}` }
          })
          return
        }

        if (isLoggedIn) {
          // ログインしている場合でredirパラメータがついてる場合は
          // pipelineへのリダイレクトをする
          // pipelineへのリダイレクトをしなくていい環境では
          // トップへリダイレクトする
          const redirect = getStringParam(context.root.$route.query.redirect)
          const redirected = redirect && redirectToPipelineIfNeeded()
          if (!redirected) {
            context.root.$router.replace('/')
          }
          return
        }

        state.show = true
      }
    )
  })
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
