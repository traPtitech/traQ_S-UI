import type { traQMarkdownIt } from '@traptitech/traq-markdown-it'

import type { MarkdownEnvironment } from '../types'

/** traq-markdown-it 7.1 の renderInline に environment を渡す adapter。 */
export const renderInlineWithEnvironment = (
  markdown: traQMarkdownIt,
  text: string,
  environment: MarkdownEnvironment
) => {
  const tokens = markdown.md.parse(text, { ...environment })
  const embeddings = markdown.embeddingExtractor.extract(tokens)

  markdown.embeddingExtractor.removeTailEmbeddings(tokens)
  markdown.embeddingExtractor.replace(tokens)

  return {
    rawText: text,
    renderedText: markdown._renderInline(tokens),
    embeddings
  }
}
