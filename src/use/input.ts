import { SetupContext } from 'vue'

type InputElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement

const useInput = (context: SetupContext, eventName = 'input') => {
  const onInput = (event: InputEvent) =>
    context.emit(eventName, (event.target as InputElement).value)
  return {
    onInput
  }
}

export default useInput
