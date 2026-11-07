import { forEachData } from './detector'

export const restoreEmbeddingLabels = (text: string) => {
  const chunks: string[] = []
  let offset = 0

  forEachData(text, (data, position) => {
    if (!data) return

    chunks.push(text.slice(offset, position.start), data.raw)
    offset = position.start + position.length
  })

  chunks.push(text.slice(offset))

  return chunks.join('')
}
