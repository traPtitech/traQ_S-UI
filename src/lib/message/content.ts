import { analyzeMarkdownSource, isLiteralSource } from '../markdown/analysis'
import { type InputPart, parseInput, serializeInput } from '../references'

export const normalizeMessageParts = (
  parts: readonly InputPart[]
): InputPart[] => {
  if (!parts.some(part => part.type === 'reference')) return [...parts]

  const source = parts
    .map(part => (part.type === 'text' ? part.text : '\uFFFC'))
    .join('')

  const ranges = analyzeMarkdownSource(source)
    .nodes.filter(isLiteralSource)
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

export const normalizeMessageSource = (source: string) =>
  serializeInput(normalizeMessageParts(parseInput(source, 'message')))
