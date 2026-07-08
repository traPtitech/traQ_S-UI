import { insertText } from '/@/lib/dom/insertText'

describe('insertText', () => {
  let textarea: HTMLTextAreaElement

  beforeEach(() => {
    textarea = document.createElement('textarea')
    textarea.value = 'before after'
  })

  afterEach(() => {
    textarea.remove()
  })

  it('uses setRangeText with the current selection and dispatches input on mobile', () => {
    textarea.setSelectionRange(7, 12)
    const setRangeText = vi.spyOn(textarea, 'setRangeText')
    const onInput = vi.fn()
    textarea.addEventListener('input', onInput)

    insertText(textarea, 'new', undefined, true)

    expect(setRangeText).toHaveBeenCalledWith('new', 7, 12, 'end')
    expect(onInput).toHaveBeenCalledOnce()
  })

  it('keeps using the non-mobile insertion path by default', () => {
    document.body.appendChild(textarea)
    textarea.focus()

    insertText(textarea, 'new', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before new')
  })

  it('normalizes \\r\\n to \\n on the non-mobile insertion path', () => {
    document.body.appendChild(textarea)
    textarea.focus()

    insertText(textarea, 'line1\r\nline2', { begin: 7, end: 12 })

    expect(textarea.value).toBe('before line1\nline2')
  })
})
