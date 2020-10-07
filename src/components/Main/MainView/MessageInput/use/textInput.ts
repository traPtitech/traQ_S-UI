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
  const onInputText = (text: string) => {
    state.text = text
  }

  const onModifierKeyDown = () => {
    state.isModifierKeyPressed = true
  }
  const onModifierKeyUp = () => {
    state.isModifierKeyPressed = false
  }

  return {
    textState: state,
    onInputText,
    onModifierKeyDown,
    onModifierKeyUp
  }
}

export default useTextInput
