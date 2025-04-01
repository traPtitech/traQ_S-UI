import { reactive, ref, watch, watchEffect } from 'vue'
import apis from '/@/lib/apis'
import useRedirectParam from './useRedirectParam'
import useCredentialManager from './useCredentialManager'
import type { AxiosError } from 'axios'
import { useMeStore } from '/@/store/domain/me'

export interface LoginState {
  name: string
  pass: string
  error: string | undefined
}

const useLogin = () => {
  const { getPass, savePass } = useCredentialManager()
  const { redirect, setRedirectSessionStorage } = useRedirectParam()
  const { fetchMe } = useMeStore()

  const state = reactive<LoginState>({
    name: '',
    pass: '',
    error: undefined
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

      await fetchMe()

      redirect()
    } catch (e) {
      const err = e as AxiosError<{ message: string }>
      if (!err.response) return

      // TODO 修正
      const message: string = err.response.data.message
      const status = err.response.status
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
        case 'this account is currently suspended':
          state.error =
            'このユーザーは凍結されています\n復旧を希望する場合は https://trap.jp/request から再入部受付をしてください。'
          break
        case 'You have already logged in. Please logout once.':
          state.error = 'ログイン済みでした。リロードします'
          // 起きないようにするのがよいが (https://github.com/traPtitech/traQ_S-UI/issues/2260)
          // とりあえずリロードする
          location.reload()
          break
        default:
          state.error = `${status}: ${message}`
      }
    }
  }
  const loginExternal = (provider: string) => {
    setRedirectSessionStorage()
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
