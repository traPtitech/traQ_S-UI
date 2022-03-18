import { Ref, ref } from 'vue'

const useToggle = (initialValueOrRef: boolean | Ref<boolean> = false) => {
  // 既にrefだった場合は渡したrefが返される
  const value = ref(initialValueOrRef)

  const open = () => {
    value.value = true
  }
  const close = () => {
    value.value = false
  }
  const toggle = () => {
    value.value = !value.value
  }

  return { value, open, close, toggle }
}

export default useToggle
