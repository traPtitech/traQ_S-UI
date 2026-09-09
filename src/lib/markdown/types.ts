import type {
  Embedding,
  messageRenderers
} from '@traq-markdown-parser/traq/renderer'

export type MarkdownRenderResult = ReturnType<
  ReturnType<typeof messageRenderers>['standard']['render']
>
export type EmbeddingOrUrl = Embedding
export type EmbeddingFile = Extract<Embedding, { type: 'file' }>
export type EmbeddingMessage = Extract<Embedding, { type: 'message' }>
export type ExternalUrl = Extract<Embedding, { type: 'url' }>
