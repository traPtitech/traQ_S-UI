import { insertText } from '/@/lib/dom/insertText'

describe('insertText', () => {
  let textarea: HTMLTextAreaElement

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
    textarea = document.createElement('textarea')
    textarea.value = 'before after'
    document.body.appendChild(textarea)
  })

  afterEach(() => {
    vi.useRealTimers()
    textarea.remove()
  })

  it('inserts at the current selection without moving focus on mobile', () => {
    const previousFocus = document.activeElement
    textarea.setSelectionRange(7, 12)
    const setRangeText = vi.spyOn(textarea, 'setRangeText')
    const onInput = vi.fn()
    const onFocus = vi.fn()
    textarea.addEventListener('input', onInput)
    textarea.addEventListener('focus', onFocus)

    insertText(textarea, 'new', undefined, true)

    expect(setRangeText).toHaveBeenCalledWith('new', 7, 12, 'end')
    expect(onInput).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(previousFocus)
    expect(textarea.value).toBe('before new')
    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)

    vi.advanceTimersToNextFrame()

    expect(document.activeElement).toBe(previousFocus)
    expect(onFocus).not.toHaveBeenCalled()
  })

  it('restores the caret after the click resets the unfocused selection', () => {
    textarea.setSelectionRange(7, 12)

    insertText(textarea, 'new', undefined, true)
    textarea.setSelectionRange(0, 0)
    vi.advanceTimersToNextFrame()

    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)
  })

  it('does not restore a stale caret after the text changes', () => {
    textarea.setSelectionRange(7, 12)

    insertText(textarea, 'new', undefined, true)
    textarea.value = 'updated'
    textarea.setSelectionRange(2, 2)
    vi.advanceTimersToNextFrame()

    expect(textarea.value).toBe('updated')
    expect(textarea.selectionStart).toBe(2)
    expect(textarea.selectionEnd).toBe(2)
  })

  it('preserves a selection made after the textarea regains focus', () => {
    textarea.setSelectionRange(7, 12)

    insertText(textarea, 'new', undefined, true)
    textarea.focus()
    textarea.setSelectionRange(2, 2)
    vi.advanceTimersToNextFrame()

    expect(textarea.selectionStart).toBe(2)
    expect(textarea.selectionEnd).toBe(2)
  })

  it('restores the latest caret when multiple insertions precede a frame', () => {
    textarea.setSelectionRange(7, 12)

    insertText(textarea, 'new', undefined, true)
    insertText(textarea, 'er', undefined, true)
    textarea.setSelectionRange(0, 0)
    vi.advanceTimersToNextFrame()

    expect(textarea.value).toBe('before newer')
    expect(textarea.selectionStart).toBe(12)
    expect(textarea.selectionEnd).toBe(12)
  })

  it('keeps using the non-mobile insertion path by default', () => {
    textarea.focus()

    insertText(textarea, 'new', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before new')
  })

  it('normalizes \\r\\n to \\n on the non-mobile insertion path', () => {
    textarea.focus()

    insertText(textarea, 'line1\r\nline2', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before line1\nline2')
  })
})
