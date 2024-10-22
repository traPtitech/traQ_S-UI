import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import apis from '/@/lib/apis'
import type { AxiosError } from 'axios'

const useRegister = () => {
  const router = useRouter()
  const registerState = reactive({
    name: '',
    password: ''
  })
  const error = ref('')

  const register = async () => {
    try {
      await apis.createUser(registerState)
      await apis.login(undefined, registerState)

      router.push('/')
    } catch (e) {
      const err = e as AxiosError<{ message: string }>
      if (!err.response) return

      const message = err.response.data.message
      const status = err.response.status
      switch (true) {
        case message.includes('name: cannot be blank.'):
          error.value = 'IDを入力してください'
          break
        case message.includes('password: cannot be blank.'):
          error.value = 'パスワードを入力してください'
          break
        case message.includes('name conflicts'):
          error.value = 'そのIDは既に使用されています'
          break
        case message.includes(
          'password: the length must be between 10 and 32.'
        ):
          error.value = 'パスワードは10～32字で入力してください'
          break
        case message.includes('name: must contain [a-zA-Z0-9_-] only.'):
          error.value =
            'IDは半角英数字とハイフン、アンダースコアのみ使用できます'
          break
        default:
          error.value = `${status}: ${message}`
      }
    }
  }

  return { registerState, error, register }
}

export default useRegister
