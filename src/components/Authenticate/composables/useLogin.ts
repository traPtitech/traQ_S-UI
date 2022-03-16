import { reactive, ref, watch, watchEffect } from 'vue'
import apis from '/@/lib/apis'
import useRedirectParam from './useRedirectParam'
import useCredentialManager from './useCredentialManager'
import { AxiosError } from 'axios'
import { useMeStore } from '/@/store/domain/me'

const useLogin = () => {
  const { getPass, savePass } = useCredentialManager()
  const { redirect } = useRedirectParam()
  const { fetchMe } = useMeStore()

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

      await fetchMe()

      redirect()
    } catch (e) {
      const err = e as AxiosError
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
        default:
          state.error = `${status}: ${message}`
      }
    }
  }
  const loginExternal = (provider: string) => {
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
