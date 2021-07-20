import { reactive, ref, watch, watchEffect } from 'vue'
import apis from '/@/lib/apis'
import useRedirectParam from './redirectParam'
import useCredentialManager from './credentialManager'
import store from '/@/store'

const useLogin = () => {
  const { getPass, savePass } = useCredentialManager()
  const { redirect } = useRedirectParam()

  const state = reactive({
    name: '',
    pass: '',
    error: undefined as string | undefined
  })
  watch(
    () => state.name + state.pass,
    () => {
      state.error = undefined
    }
  )

  const saved = ref<PasswordCredential | null>(null)
  watchEffect(async () => {
    const res = await getPass()
    if (!res) return
    saved.value = res
  })

  const dontUseSaved = () => {
    saved.value = null
  }

  const loginWithSaved = () => {
    if (!saved.value || !saved.value.id || !saved.value.password) return
    state.name = saved.value.id
    state.pass = saved.value.password ?? ''
    login()
  }

  const login = async () => {
    // @はユーザー名に含まれることはなく、
    // 先頭に@を入れている場合があるのでその場合は@を削除する
    const name = state.name.replace(/^@/, '')

    try {
      await apis.login(undefined, { name, password: state.pass })
      await savePass(state.name, state.pass)

      await store.dispatch.domain.me.fetchMe()

      redirect()
    } catch (e) {
      // TODO 修正
      const message = e.response.data.message as string
      const status = e.response.status as number
      switch (message) {
        case 'name: cannot be blank; password: cannot be blank.':
          state.error = 'IDとパスワードを入力してください'
          break
        case 'password: cannot be blank.':
          state.error = 'パスワードを入力してください'
          break
        case 'name: cannot be blank.':
          state.error = 'IDを入力してください'
          break
        case 'invalid name':
          state.error = `"${state.name}" は存在しないユーザーIDです`
          break
        case 'password or id is wrong':
          state.error = 'IDまたはパスワードが誤っています'
          break
        default:
          state.error = `${status}: ${message}`
      }
    }
  }
  const loginExternal = async (provider: string) => {
    // TODO: 内部リダイレクト対応
    location.href = `/api/auth/${provider}`
  }
  return {
    loginState: state,
    saved,
    login,
    loginWithSaved,
    loginExternal,
    dontUseSaved
  }
}

export default useLogin
