type InputElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement

const useInput = <EventName extends string = 'input-value'>(
  emit: (name: EventName, value: string | number) => void,
  eventName: EventName
) => {
  const onInput = (event: Event) =>
    emit(eventName, (event.target as InputElement).value)
  return {
    onInput
  }
}

export default useInput
