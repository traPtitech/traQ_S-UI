import {
  analyzeMarkdownSource,
  isLiteralSource,
  protectsMessageReferences
} from '../markdown/analysis'
import { embeddingTokens } from '../markdown/embeddingTokens'
import {
  type InternalLinkGetters,
  embedInternalLinks
} from '../markdown/internalLinkEmbedder'
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

export const resolveMessageReferences = (
  source: string,
  getters: InternalLinkGetters
) => {
  const content = normalizeMessageSource(source)
  if (!/[@＠#＃]/.test(content)) return content

  const protectedRanges: { from: number; to: number }[] = []
  let markdown = ''
  let offset = 0

  for (const { start, length, source, value } of embeddingTokens(content)) {
    if (value === undefined) continue

    // JSON の中身を Markdown として解釈させず、原文の位置は保つ。
    markdown +=
      content.slice(offset, start) + source.replace(/[^\r\n]/g, '\uFFFC')
    offset = start + length
    protectedRanges.push({ from: start, to: offset })
  }

  markdown += content.slice(offset)
  protectedRanges.push(
    ...analyzeMarkdownSource(markdown).nodes.filter(protectsMessageReferences)
  )

  let result = ''
  offset = 0

  for (const { from, to } of protectedRanges.sort((a, b) => a.from - b.from)) {
    if (to <= offset) continue

    if (offset < from)
      result += embedInternalLinks(content.slice(offset, from), getters)

    result += content.slice(Math.max(from, offset), to)
    offset = to
  }

  return result + embedInternalLinks(content.slice(offset), getters)
}
