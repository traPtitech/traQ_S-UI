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
    textarea.setRangeText(
      text,
      target?.begin ?? textarea.selectionStart,
      target?.end ?? textarea.selectionEnd,
      'end'
    )

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
