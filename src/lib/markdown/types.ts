import type {
  Embedding,
  messageRenderer
} from '@traq-markdown-parser/traq/renderer/v1'

export type MarkdownRenderResult = ReturnType<
  ReturnType<typeof messageRenderer>['render']
>
export type EmbeddingOrUrl = Embedding
export type EmbeddingFile = Extract<Embedding, { type: 'file' }>
export type EmbeddingMessage = Extract<Embedding, { type: 'message' }>
export type ExternalUrl = Extract<Embedding, { type: 'url' }>
