import EmbeddingExtractor from '@traptitech/traq-markdown-it/src/embeddingExtractor.ts'

export const isEmbeddedLink = (text: string, origin: string) =>
  new EmbeddingExtractor(origin).urlToEmbeddingData(text) !== undefined
