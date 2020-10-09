import { SetupContext } from 'vue'

type InputElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement

const useInput = <EventName extends string>(
  context: SetupContext<{ [K in EventName]: (value: string) => true }>,
  eventName: EventName = 'input-value' as EventName
) => {
  const onInput = (event: InputEvent) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (context.emit as any)(eventName, (event.target as InputElement).value)
  return {
    onInput
  }
}

export default useInput
