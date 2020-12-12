import { computed, reactive } from 'vue'

export type TextState = {
  text: string
  isEmpty: boolean
  isModifierKeyPressed: boolean
}
const useTextInput = (initialText = '') => {
  const state: TextState = reactive({
    text: initialText,
    isEmpty: computed(() => state.text.length === 0),
    isModifierKeyPressed: false
  })

  const onModifierKeyDown = () => {
    state.isModifierKeyPressed = true
  }
  const onModifierKeyUp = () => {
    state.isModifierKeyPressed = false
  }

  return {
    textState: state,
    onModifierKeyDown,
    onModifierKeyUp
  }
}

export default useTextInput
