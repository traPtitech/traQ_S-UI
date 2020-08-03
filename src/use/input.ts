import { SetupContext } from 'vue'

type InputElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement

const useInput = (context: SetupContext) => {
  const onInput = (event: InputEvent) =>
    context.emit('input', (event.target as InputElement).value)
  return {
    onInput
  }
}

export default useInput
