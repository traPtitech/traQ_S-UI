import type {
  EmbeddingFile,
  EmbeddingMessage,
  ExternalUrl,
  EmbeddingOrUrl
} from '@traptitech/traq-markdown-it'

export const isFile = (e: EmbeddingOrUrl): e is EmbeddingFile =>
  e.type === 'file'
export const isMessage = (e: EmbeddingOrUrl): e is EmbeddingMessage =>
  e.type === 'message'
export const isExternalUrl = (e: EmbeddingOrUrl): e is ExternalUrl =>
  e.type === 'url'
