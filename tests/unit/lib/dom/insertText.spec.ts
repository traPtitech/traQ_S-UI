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
    vi.restoreAllMocks()
    textarea.remove()
  })

  it('inserts at the current selection without moving focus', () => {
    const previousFocus = document.activeElement
    textarea.setSelectionRange(7, 12)
    const setRangeText = vi.spyOn(textarea, 'setRangeText')
    const onInput = vi.fn()
    const onFocus = vi.fn()
    textarea.addEventListener('input', onInput)
    textarea.addEventListener('focus', onFocus)

    insertText(textarea, 'new', undefined, { allowFocus: false })

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

    insertText(textarea, 'new', undefined, { allowFocus: false })
    textarea.setSelectionRange(0, 0)
    vi.advanceTimersToNextFrame()

    expect(textarea.selectionStart).toBe(10)
    expect(textarea.selectionEnd).toBe(10)
  })

  it('does not restore a stale caret after the text changes', () => {
    textarea.setSelectionRange(7, 12)

    insertText(textarea, 'new', undefined, { allowFocus: false })
    textarea.value = 'updated'
    textarea.setSelectionRange(2, 2)
    vi.advanceTimersToNextFrame()

    expect(textarea.value).toBe('updated')
    expect(textarea.selectionStart).toBe(2)
    expect(textarea.selectionEnd).toBe(2)
  })

  it('preserves a selection made after the textarea regains focus', () => {
    textarea.setSelectionRange(7, 12)

    insertText(textarea, 'new', undefined, { allowFocus: false })
    textarea.focus()
    textarea.setSelectionRange(2, 2)
    vi.advanceTimersToNextFrame()

    expect(textarea.selectionStart).toBe(2)
    expect(textarea.selectionEnd).toBe(2)
  })

  it('restores the latest caret when multiple insertions precede a frame', () => {
    textarea.setSelectionRange(7, 12)

    insertText(textarea, 'new', undefined, { allowFocus: false })
    insertText(textarea, 'er', undefined, { allowFocus: false })
    textarea.setSelectionRange(0, 0)
    vi.advanceTimersToNextFrame()

    expect(textarea.value).toBe('before newer')
    expect(textarea.selectionStart).toBe(12)
    expect(textarea.selectionEnd).toBe(12)
  })

  it('keeps using the native insertion path by default', () => {
    textarea.focus()

    insertText(textarea, 'new', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before new')
  })

  it('normalizes \\r\\n to \\n on the native insertion path', () => {
    textarea.focus()

    insertText(textarea, 'line1\r\nline2', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before line1\nline2')
  })

  it('restores desktop focus after native insertion', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)
    button.focus()
    const execCommand = vi.spyOn(document, 'execCommand')

    insertText(textarea, 'new', { begin: 7, end: 12 })

    expect(execCommand).toHaveBeenCalledWith('insertText', false, 'new')
    expect(textarea.value).toBe('before new')
    expect(document.activeElement).toBe(button)
    button.remove()
  })

  it('uses the requested range even when focusing resets the selection', () => {
    textarea.addEventListener('focus', () => textarea.setSelectionRange(0, 0))

    insertText(textarea, 'new', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before new')
  })

  it.each(['returns false', 'throws'])(
    'falls back when execCommand %s',
    failure => {
      textarea.focus()
      vi.spyOn(document, 'execCommand').mockImplementation(() => {
        if (failure === 'throws') throw new Error('unsupported')
        return false
      })
      const onInput = vi.fn()
      textarea.addEventListener('input', onInput)

      insertText(textarea, 'new', { begin: 7, end: 12 })

      expect(textarea.value).toBe('before new')
      expect(textarea.selectionStart).toBe(10)
      expect(textarea.selectionEnd).toBe(10)
      expect(onInput).toHaveBeenCalledOnce()
      expect(document.activeElement).toBe(textarea)
    }
  )

  it('does not insert twice when execCommand changes the value but returns false', () => {
    textarea.focus()
    vi.spyOn(document, 'execCommand').mockImplementation(() => {
      textarea.setRangeText('new', 7, 12, 'end')
      textarea.dispatchEvent(new Event('input'))
      return false
    })
    const onInput = vi.fn()
    textarea.addEventListener('input', onInput)

    insertText(textarea, 'new', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before new')
    expect(onInput).toHaveBeenCalledOnce()
  })

  it('replaces a selection with empty text', () => {
    textarea.focus()
    const execCommand = vi.spyOn(document, 'execCommand')

    insertText(textarea, '', { begin: 7, end: 12 })

    expect(execCommand).toHaveBeenCalledWith('delete', false, '')
    expect(textarea.value).toBe('before ')
  })

  it('normalizes line endings and the caret on the unfocused insertion path', () => {
    insertText(
      textarea,
      'line1\r\nline2',
      { begin: 7, end: 12 },
      { allowFocus: false }
    )

    expect(textarea.value).toBe('before line1\nline2')
    expect(textarea.selectionEnd).toBe(textarea.value.length)
  })
})
