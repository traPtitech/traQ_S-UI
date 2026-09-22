import type {
  Embedding,
  messageRenderers
} from '@traq-flavored-markdown/sdk/renderer'

export type MarkdownRenderResult = ReturnType<
  ReturnType<typeof messageRenderers>['standard']['render']
>
export type EmbeddingOrUrl = Embedding
export type EmbeddingFile = Extract<Embedding, { type: 'file' }>
export type EmbeddingMessage = Extract<Embedding, { type: 'message' }>
export type ExternalUrl = Extract<Embedding, { type: 'url' }>
