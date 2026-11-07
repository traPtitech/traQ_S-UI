import type { SourceAnalysis } from '@traq-flavored-markdown/sdk/editor'
import { endsWithResourceCard } from '@traq-flavored-markdown/sdk/renderer'

import { isLiteralSource } from '../markdown/analysis'
import { markdownParser } from '../markdown/syntax'
import { type InputPart, parseInput, serializeInput } from '../references'
import {
  analyzeProjectedInput,
  partsToProjectedText
} from '../references/projection'

export const normalizeMessageParts = (
  parts: readonly InputPart[],
  analysis?: SourceAnalysis
): InputPart[] => {
  if (!parts.some(part => part.type === 'reference')) return [...parts]

  const projectedText = partsToProjectedText(parts)

  const ranges = (
    analysis?.source === projectedText
      ? analysis
      : analyzeProjectedInput(projectedText)
  ).nodes
    .filter(isLiteralSource)
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

export const createMessageContentBuilder = (
  source: string,
  embeddingOrigin: string
) => {
  const trimmed = source.trimEnd()
  const endsWithEmbed =
    trimmed !== '' &&
    endsWithResourceCard(markdownParser.parse(trimmed), embeddingOrigin)
  const text = endsWithEmbed ? trimmed : source
  const delimiter = trimmed === '' || endsWithEmbed ? '\n' : '\n\n'

  return (fileUrls: readonly string[]) =>
    [text, fileUrls.join('\n')].filter(Boolean).join(delimiter)
}
