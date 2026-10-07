export const insertText = (
  textarea: HTMLTextAreaElement,
  text: string,
  target: {
    begin?: number
    end?: number
  } = {},
  { isComposing = false, allowFocus = true } = {}
) => {
  const document = textarea.ownerDocument
  const previousFocus = document.activeElement
  const begin = target.begin ?? textarea.selectionStart
  const end = target.end ?? textarea.selectionEnd
  const normalizedText = text.replaceAll('\r\n', '\n')

  if (
    !isComposing &&
    typeof document.execCommand === 'function' &&
    (previousFocus === textarea || allowFocus)
  ) {
    const value = textarea.value
    let inserted: boolean

    try {
      if (previousFocus !== textarea) {
        textarea.focus({ preventScroll: true })
      }
      textarea.setSelectionRange(begin, end)
      inserted = document.execCommand(
        normalizedText === '' ? 'delete' : 'insertText',
        false,
        normalizedText
      )
    } catch {
      inserted = false
    } finally {
      if (previousFocus !== textarea) {
        textarea.blur()
        if (previousFocus instanceof HTMLElement) {
          previousFocus.focus({ preventScroll: true })
        }
      }
    }

    if (inserted || textarea.value !== value) return
  }

  textarea.setRangeText(normalizedText, begin, end, 'end')

  if (document.activeElement !== textarea) {
    const value = textarea.value
    const caret = textarea.selectionEnd

    requestAnimationFrame(() => {
      if (document.activeElement !== textarea && textarea.value === value) {
        textarea.setSelectionRange(caret, caret)
      }
    })
  }

  textarea.dispatchEvent(new Event('input'))
}
