import type {
  EmbeddingFile,
  EmbeddingMessage,
  EmbeddingOrUrl,
  ExternalUrl
} from '/@/lib/markdown/types'

export const isFile = (e: EmbeddingOrUrl): e is EmbeddingFile =>
  e.type === 'file'
export const isMessage = (e: EmbeddingOrUrl): e is EmbeddingMessage =>
  e.type === 'message'
export const isExternalUrl = (e: EmbeddingOrUrl): e is ExternalUrl =>
  e.type === 'url'
