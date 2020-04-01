import { SetupContext } from '@vue/composition-api'

type InputElement = HTMLTextAreaElement | HTMLInputElement

const useInput = (context: SetupContext) => {
  const onInput = (event: InputEvent) =>
    context.emit('input', (event.target as InputElement).value)
  return {
    onInput
  }
}

export default useInput
