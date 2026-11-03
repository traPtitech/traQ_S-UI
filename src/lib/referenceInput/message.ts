import { type InputPart, parseInput, serializeInput } from './document'
import { analyzeMarkdown } from './markdown'

export const normalizeMessageParts = (
  parts: readonly InputPart[]
): InputPart[] => {
  if (!parts.some(part => part.type === 'reference')) return [...parts]

  const source = parts
    .map(part => (part.type === 'text' ? part.text : '\uFFFC'))
    .join('')

  const ranges = analyzeMarkdown(source)
    .formats.filter(
      format =>
        format.kind === 'literal' ||
        (format.kind === 'source-only' && format.replacement.type === 'math')
    )
    .sort((a, b) => a.from - b.from)

  let offset = 0
  let index = 0

  return parts.map(part => {
    while ((ranges[index]?.to ?? Infinity) <= offset) index++
    const range = ranges[index]
    const literal = range && range.from <= offset && offset < range.to
    offset += part.type === 'text' ? part.text.length : 1

    return literal && part.type === 'reference'
      ? { type: 'text', text: part.reference.raw }
      : part
  })
}

export const messageContent = (source: string) =>
  serializeInput(normalizeMessageParts(parseInput(source, 'message')))
