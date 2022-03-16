import { ref } from 'vue'

const useModifierKey = () => {
  const isModifierKeyPressed = ref(false)

  const onModifierKeyDown = () => {
    isModifierKeyPressed.value = true
  }
  const onModifierKeyUp = () => {
    isModifierKeyPressed.value = false
  }

  return {
    isModifierKeyPressed,
    onModifierKeyDown,
    onModifierKeyUp
  }
}

export default useModifierKey
