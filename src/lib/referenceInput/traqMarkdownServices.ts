import { createHtmlRenderer } from '@traq-flavored-markdown/sdk/renderer'
import type { MarkdownServices } from '@traq-flavored-markdown/vue-editor'

import { analyzeMarkdownSource } from '../markdown/analysis'
import { presentation } from '../markdown/presentation'

const renderer = createHtmlRenderer(presentation)
export const defaultMarkdownServices: MarkdownServices = {
  analyze: analyzeMarkdownSource,
  render: (document, node) =>
    renderer.createSession(document).render({ roots: [node] })
}
