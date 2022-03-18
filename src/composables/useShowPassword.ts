import { computed } from 'vue'
import useToggle from './utils/useToggle'

const useShowPassword = (props: { type: string }) => {
  const { value: isPasswordShown, toggle: togglePassword } = useToggle()

  const typeWithShown = computed(() => {
    if (props.type !== 'password') return props.type
    return isPasswordShown.value ? 'text' : 'password'
  })

  return { isPasswordShown, togglePassword, typeWithShown }
}

export default useShowPassword
