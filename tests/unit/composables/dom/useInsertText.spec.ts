import useInsertTextWithoutSetup from '/@/composables/dom/useInsertText'
import { isTouchDevice } from '/@/lib/dom/browser'

import { setupMatchMedia } from '../../mocks/matchMedia'
import { withSetup } from '../../testUtils'

vi.mock('/@/lib/dom/browser', () => ({
  isTouchDevice: vi.fn(() => false)
}))

const useInsertText = withSetup(useInsertTextWithoutSetup)

describe('useInsertText', () => {
  beforeEach(() => {
    vi.mocked(isTouchDevice).mockReturnValue(false)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    setupMatchMedia()
  })

  it('uses the non-mobile insertText path when matchMedia does not match', () => {
    setupMatchMedia(false)
    const textarea = document.createElement('textarea')
    textarea.value = 'before after'
    textarea.setSelectionRange(7, 12)
    document.body.appendChild(textarea)
    textarea.focus()
    const execCommand = vi.spyOn(document, 'execCommand')
    const [{ insertText }, { unmount }] = useInsertText(textarea)

    insertText('new')

    expect(execCommand).toHaveBeenCalledWith('insertText', false, 'new')
    expect(textarea.value).toBe('before new')
    unmount()
    textarea.remove()
  })

  it('uses the mobile insertText path when matchMedia matches', () => {
    setupMatchMedia(true)
    const textarea = document.createElement('textarea')
    textarea.value = 'before after'
    textarea.setSelectionRange(7, 12)
    const setRangeText = vi.spyOn(textarea, 'setRangeText')
    const onInput = vi.fn()
    textarea.addEventListener('input', onInput)
    const [{ insertText }, { unmount }] = useInsertText(textarea)

    insertText('new')

    expect(setRangeText).toHaveBeenCalledWith('new', 7, 12, 'end')
    expect(onInput).toHaveBeenCalledOnce()
    unmount()
  })

  it('inserts on a wide touch device without moving focus', () => {
    setupMatchMedia(false)
    vi.mocked(isTouchDevice).mockReturnValue(true)
    const textarea = document.createElement('textarea')
    textarea.value = 'before after'
    document.body.appendChild(textarea)
    const button = document.createElement('button')
    document.body.appendChild(button)
    button.focus()
    const onFocus = vi.fn()
    const onInput = vi.fn()
    textarea.addEventListener('focus', onFocus)
    textarea.addEventListener('input', onInput)
    const [{ insertText }, { unmount }] = useInsertText(textarea, {
      begin: 7,
      end: 12
    })

    insertText('new')
    vi.advanceTimersToNextFrame()

    expect(textarea.value).toBe('before new')
    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)
    expect(onInput).toHaveBeenCalledOnce()
    expect(onFocus).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(button)
    unmount()
    textarea.remove()
    button.remove()
  })
})
