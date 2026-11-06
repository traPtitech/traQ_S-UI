import type { ResourceCard } from '@traq-flavored-markdown/sdk/renderer'

export interface MarkdownRenderResult {
  rawText: string
  renderedText: string
  embeddings: ResourceCard[]
}
export type EmbeddingOrUrl = ResourceCard
export type EmbeddingFile = ResourceCard & { type: 'file' }
export type EmbeddingMessage = ResourceCard & { type: 'message' }
export type ExternalUrl = ResourceCard & { type: 'url' }
