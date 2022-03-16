import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import apis from '/@/lib/apis'

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
      error.value = '' + e
    }
  }

  return { registerState, error, register }
}

export default useRegister
