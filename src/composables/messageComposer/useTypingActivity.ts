import { type MaybeRefOrGetter, onScopeDispose, toValue, watch } from 'vue'

export const useTypingActivity = (options: {
  text: MaybeRefOrGetter<string>
  focused: MaybeRefOrGetter<boolean>
  documentKey: MaybeRefOrGetter<string | number>
  onChange: (typing: boolean) => void
}) => {
  let timeout: ReturnType<typeof setTimeout> | undefined

  const stop = () => {
    clearTimeout(timeout)
    timeout = undefined
    options.onChange(false)
  }

  watch(
    () => [toValue(options.text), toValue(options.documentKey)] as const,
    ([text, key], [, previousKey]) => {
      stop()

      if (key !== previousKey || !text || !toValue(options.focused)) return

      options.onChange(true)
      timeout = setTimeout(stop, 10000)
    }
  )

  watch(
    () => toValue(options.focused),
    focused => {
      if (!focused) stop()
    }
  )

  onScopeDispose(stop)
}
