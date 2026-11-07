import { effectScope, nextTick, ref } from 'vue'

import { useTypingActivity } from '/@/composables/messageComposer/useTypingActivity'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const setup = () => {
  const scope = effectScope()
  const text = ref('')
  const focused = ref(true)
  const documentKey = ref('first')
  const onChange = vi.fn()

  scope.run(() => useTypingActivity({ text, focused, documentKey, onChange }))

  return { scope, text, focused, documentKey, onChange }
}

it('cancels the previous timeout when text is cleared and entered again', async () => {
  const { scope, text, onChange } = setup()

  try {
    text.value = 'first'
    await nextTick()
    vi.advanceTimersByTime(1000)
    text.value = ''
    await nextTick()
    expect(onChange).toHaveBeenLastCalledWith(false)

    vi.advanceTimersByTime(1000)
    text.value = 'next'
    await nextTick()
    vi.advanceTimersByTime(8000)
    expect(onChange).toHaveBeenLastCalledWith(true)

    vi.advanceTimersByTime(2000)
    expect(onChange).toHaveBeenLastCalledWith(false)
  } finally {
    scope.stop()
  }
})

it.each(['blur', 'document', 'dispose'] as const)(
  'stops typing and cancels pending callbacks on %s',
  async reason => {
    const { scope, text, focused, documentKey, onChange } = setup()

    try {
      text.value = 'typing'
      await nextTick()

      if (reason === 'blur') focused.value = false
      if (reason === 'document') documentKey.value = 'second'
      if (reason === 'dispose') scope.stop()
      await nextTick()

      expect(onChange).toHaveBeenLastCalledWith(false)
      onChange.mockClear()
      vi.advanceTimersByTime(10000)
      expect(onChange).not.toHaveBeenCalled()
    } finally {
      scope.stop()
    }
  }
)

it('does not report typing just because focus returns', async () => {
  const { scope, text, focused, onChange } = setup()

  try {
    text.value = 'draft'
    await nextTick()
    focused.value = false
    await nextTick()
    onChange.mockClear()
    focused.value = true
    await nextTick()

    expect(onChange).not.toHaveBeenCalled()
  } finally {
    scope.stop()
  }
})
