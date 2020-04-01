import { defineComponent, computed, reactive } from '@vue/composition-api'

export type TextState = {
  text: string
  isEmpty: boolean
}
const useTextInput = () => {
  const state: TextState = reactive({
    text: '',
    isEmpty: computed(() => state.text.length === 0)
  })
  const onInputText = (text: string) => {
    state.text = text
  }
  return {
    textState: state,
    onInputText
  }
}

export default useTextInput
