import { nextTick, ref, shallowRef } from 'vue'

import useTextStampPickerInvokerWithoutSetup from '/@/components/Main/MainView/composables/useTextStampPickerInvoker'
import { shouldAutoFocus } from '/@/lib/dom/browser'
import { useStampPicker, useStampPickerInvoker } from '/@/store/ui/stampPicker'

import { withSetup } from '../../../../testUtils'

vi.mock('/@/lib/dom/browser', () => ({
  isWebKit: () => false,
  shouldAutoFocus: vi.fn(() => false)
}))
vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: () => ({
    stampsMap: ref(new Map([['stamp-id', { name: 'stamp' }]]))
  })
}))
vi.mock('/@/store/ui/stampPicker', () => ({
  useStampPicker: vi.fn(),
  useStampPickerInvoker: vi.fn()
}))

const useTextStampPickerInvoker = withSetup(
  useTextStampPickerInvokerWithoutSetup
)

describe('useTextStampPickerInvoker', () => {
  let textarea: HTMLTextAreaElement
  let unmount: (() => void) | undefined

  beforeEach(() => {
    textarea = document.createElement('textarea')
    textarea.value = 'before after'
    document.body.appendChild(textarea)
    vi.mocked(shouldAutoFocus).mockReturnValue(false)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
  })

  afterEach(() => {
    unmount?.()
    unmount = undefined
    textarea.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const setup = async (shown = false) => {
    const isStampPickerShown = ref(shown)
    const openStampPicker = vi.fn(() => {
      expect(document.activeElement).not.toBe(textarea)
      isStampPickerShown.value = true
    })
    const closeStampPicker = vi.fn(() => {
      isStampPickerShown.value = false
    })
    const toggleStampPicker = vi.fn(() => {
      if (isStampPickerShown.value) closeStampPicker()
      else openStampPicker()
    })
    vi.mocked(useStampPicker).mockReturnValue({
      isStampPickerShown
    } as ReturnType<typeof useStampPicker>)
    vi.mocked(useStampPickerInvoker).mockReturnValue({
      isThisOpen: isStampPickerShown,
      openStampPicker,
      closeStampPicker,
      toggleStampPicker
    })
    const text = ref(textarea.value)
    textarea.addEventListener('input', () => {
      text.value = textarea.value
    })
    const [result, cleanup] = useTextStampPickerInvoker(
      text,
      shallowRef(textarea),
      shallowRef(textarea)
    )
    unmount = cleanup.unmount
    await nextTick()
    return { ...result, text, open: openStampPicker, close: closeStampPicker }
  }

  it.each(['openStampPicker', 'toggleStampPicker'] as const)(
    'blurs before %s and inserts at the caret without refocusing on touch devices',
    async method => {
      const picker = await setup()
      textarea.focus()
      textarea.setSelectionRange(7, 7)
      textarea.dispatchEvent(new CompositionEvent('compositionstart'))
      textarea.addEventListener('blur', () => {
        textarea.dispatchEvent(new CompositionEvent('compositionend'))
      })
      const onFocus = vi.fn()
      textarea.addEventListener('focus', onFocus)
      const execCommand = vi.spyOn(document, 'execCommand')

      picker[method]()

      expect(picker.open).toHaveBeenCalledOnce()
      expect(document.activeElement).not.toBe(textarea)
      const select = vi.mocked(useStampPickerInvoker).mock.calls.at(-1)?.[0]
      expect(select).toBeDefined()
      select?.({ id: 'stamp-id' })
      vi.advanceTimersToNextFrame()

      expect(picker.text.value).toBe('before :stamp:after')
      expect(textarea.selectionStart).toBe(14)
      expect(textarea.selectionEnd).toBe(14)
      expect(onFocus).not.toHaveBeenCalled()
      expect(execCommand).not.toHaveBeenCalled()
    }
  )

  it('closes an already open picker without blurring the textarea again', async () => {
    const picker = await setup(true)
    textarea.focus()

    picker.toggleStampPicker()

    expect(picker.close).toHaveBeenCalledOnce()
    expect(picker.open).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(textarea)
  })
})
