import { withDefaultAdapters } from '@traq-flavored-markdown/sdk/adapters'
import { createHtmlRenderer } from '@traq-flavored-markdown/sdk/renderer'

import { markdownParser } from '/@/lib/markdown/syntax'

const renderer = createHtmlRenderer(withDefaultAdapters())
export const getMarkdownRenderer = () => ({
  render: (source: string) => ({
    renderedText: renderer.render(markdownParser.parse(source))
  })
})
export const renderInlineWithCurrentEntities = (source: string) => ({
  renderedText: renderer.render(markdownParser.parseInline(source))
})
