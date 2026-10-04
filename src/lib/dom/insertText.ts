import { insert } from 'text-field-edit'

import { isDefined } from '/@/lib/basic/array'

export const insertText = (
  textarea: HTMLTextAreaElement,
  text: string,
  target: {
    begin?: number
    end?: number
  } = {},
  isMobile = false
) => {
  // `execCommand` は deprecated だが，`setRangeText` は undo できなくなってしまうので，PC の場合は `execCommand` を用いる．
  // `execCommand` は主にモバイル端末での挙動が怪しいので，それを改善するためのワークアラウンド．
  if (isMobile) {
    const begin = target?.begin ?? textarea.selectionStart
    const end = target?.end ?? textarea.selectionEnd

    textarea.setRangeText(text, begin, end, 'end')

    if (textarea.ownerDocument.activeElement !== textarea) {
      const value = textarea.value
      const caret = textarea.selectionEnd

      requestAnimationFrame(() => {
        if (
          textarea.ownerDocument.activeElement !== textarea &&
          textarea.value === value
        ) {
          textarea.setSelectionRange(caret, caret)
        }
      })
    }

    textarea.dispatchEvent(new Event('input'))
  } else {
    if (isDefined(target?.begin)) textarea.selectionStart = target.begin
    if (isDefined(target?.end)) textarea.selectionEnd = target.end

    // Windowsでの\r\nを含む文字列を貼り付けた後に
    // Ctrl+Zでアンドゥすると、キャレットの位置がずれるので
    // ずれないように\nに統一しておく
    insert(textarea, text.replaceAll('\r\n', '\n'))
  }
}
