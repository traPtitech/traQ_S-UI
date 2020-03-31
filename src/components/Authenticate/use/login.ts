import { defineComponent, reactive, computed } from '@vue/composition-api'
import api from '@/lib/api'

const useLogin = () => {
  const state = reactive({
    name: '',
    pass: '',
    error: undefined as string | undefined
  })
  const setName = (name: string) => {
    state.error = undefined
    state.name = name
  }
  const setPass = (pass: string) => {
    state.error = undefined
    state.pass = pass
  }
  const login = async () => {
    try {
      await api.login('/', { name: state.name, password: state.pass })
      location.href = '/'
    } catch {
      state.error = 'ログインに失敗しました'
    }
  }
  return {
    loginState: state,
    login,
    setName,
    setPass
  }
}

export default useLogin
