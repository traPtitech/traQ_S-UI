document.execCommand = (
  command: string,
  _showUI?: boolean,
  value?: string
): boolean => {
  if (command === 'insertText' && document.activeElement) {
    const el = document.activeElement as HTMLTextAreaElement | HTMLInputElement
    if ('setRangeText' in el) {
      el.setRangeText(
        value ?? '',
        el.selectionStart ?? 0,
        el.selectionEnd ?? 0,
        'end'
      )
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }
  }
  return false
}
