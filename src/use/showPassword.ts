import { ref, computed } from 'vue'

const useShowPassword = (props: { type: string }) => {
  const isPasswordShown = ref(false)
  const togglePassword = () => {
    isPasswordShown.value = !isPasswordShown.value
  }

  const typeWithShown = computed(() => {
    if (props.type !== 'password') return props.type
    return isPasswordShown.value ? 'text' : 'password'
  })

  return { isPasswordShown, togglePassword, typeWithShown }
}

export default useShowPassword
