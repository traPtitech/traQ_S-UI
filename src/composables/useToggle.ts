import { isRef, Ref, ref } from 'vue'

const useToggle = (initialValueOrRef: boolean | Ref<boolean> = false) => {
  const value = isRef(initialValueOrRef)
    ? initialValueOrRef
    : ref(initialValueOrRef)

  const open = () => {
    value.value = true
  }
  const close = () => {
    value.value = true
  }
  const toggle = () => {
    value.value = !value.value
  }

  return { value, open, close, toggle }
}

export default useToggle
