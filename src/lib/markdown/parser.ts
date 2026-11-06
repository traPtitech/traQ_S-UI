import { embeddingOrigin } from '/@/lib/apis'

import { renderInlineWithEnvironment } from './compatibility/renderer'
import { markdownStore } from './store'
import { configureMarkdownDialect } from './syntax'
import { traQMarkdownIt } from './traq-markdown-it'
import type { MarkdownEnvironment } from './types'

const autoDirectionTokenTypes = new Set([
  'paragraph_open',
  'heading_open',
  'list_item_open',
  'th_open',
  'td_open'
])

let markdown: traQMarkdownIt | undefined

export const createMarkdownRenderer = () => {
  const markdown = new traQMarkdownIt(markdownStore, [], embeddingOrigin)

  configureMarkdownDialect(markdown.md)

  markdown.md.core.ruler.after('inline', 'bidi-auto-direction', state => {
    for (const token of state.tokens) {
      if (autoDirectionTokenTypes.has(token.type)) token.attrSet('dir', 'auto')
    }
  })

  return markdown
}

export const getMarkdownRenderer = () => (markdown ??= createMarkdownRenderer())

export const renderInlineWithCurrentEntities = (
  text: string,
  environment?: MarkdownEnvironment
) => {
  const markdown = getMarkdownRenderer()
  if (!environment) return markdown.renderInline(text)

  return renderInlineWithEnvironment(markdown, text, environment)
}
