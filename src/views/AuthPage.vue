<template>
  <authenticate-main-view :show="state.show" :type="type" />
</template>

<script lang="ts">
import { onMounted, reactive, computed, watch } from 'vue'
import { RouteName } from '/@/router'
import useRedirectParam from '/@/components/Authenticate/composables/useRedirectParam'
import { useRouter } from 'vue-router'
import { useMeStore } from '/@/store/domain/me'

export type PageType =
  | RouteName.Login
  | RouteName.ResetPassword
  | RouteName.Registration
  | RouteName.Consent

const usePageSwitch = (props: { type: PageType }) => {
  const router = useRouter()
  const { detail, fetchMe } = useMeStore()
  const { redirect } = useRedirectParam()
  const state = reactive({
    show: false
  })

  const isConsent = computed(() => props.type === 'consent')

  const updateState = async () => {
    await fetchMe()
    const isLoggedIn = detail.value !== undefined

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
</script>

<script lang="ts" setup>
import AuthenticateMainView from '/@/components/Authenticate/AuthenticateMainView.vue'

const props = withDefaults(
  defineProps<{
    type?: PageType
  }>(),
  {
    type: RouteName.Login
  }
)

const state = usePageSwitch(props)
</script>
