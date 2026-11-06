import { getActivePinia } from 'pinia'

import { renderStampInline } from '../markdown/compatibility/stampRenderer'
import type { MarkdownFormat } from './markdown'

export const renderMarkdownWidget = (
  format: Extract<MarkdownFormat, { kind: 'rendered-inline' }>
) => {
  const { replacement } = format
  const span = document.createElement('span')
  span.className = `markdown-input-${format.className} markdown-body`

  if (replacement.type === 'stamp' && getActivePinia()) {
    // 取得済みのスタンプは、原文を一度表示せずにウィジェットを組み立てる。
    const renderedText = renderStampInline(replacement.text)

    if (renderedText !== replacement.text) {
      span.innerHTML = renderedText
      return span
    }
  }

  span.textContent = replacement.text

  void import('../markdown/markdown')
    .then(async ({ renderInline }) => {
      const { renderedText } = await renderInline(
        replacement.text,
        replacement.environment
      )

      if (span.isConnected) span.innerHTML = renderedText
    })
    .catch(() => {
      span.textContent = replacement.text
    })

  return span
}
