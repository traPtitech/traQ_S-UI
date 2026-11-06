import { isLiteralSource } from '../markdown/analysis'
import { isEmbeddedLink } from '../markdown/compatibility/embeddingLinks'
import {
  type EditorTextAnalysis,
  analyzeEditorText,
  partsToEditorText
} from '../referenceInput/editorText'
import { type InputPart, parseInput, serializeInput } from '../references'

export const normalizeMessageParts = (
  parts: readonly InputPart[],
  analysis?: EditorTextAnalysis
): InputPart[] => {
  if (!parts.some(part => part.type === 'reference')) return [...parts]

  const editorText = partsToEditorText(parts)

  const ranges = (
    analysis?.source === editorText ? analysis : analyzeEditorText(editorText)
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

export const prepareMessageContent = (
  source: string,
  embeddingOrigin: string
) => {
  const trimmed = source.trimEnd()
  const lastLine = trimmed.split('\n').at(-1) ?? ''
  const endsWithEmbed =
    trimmed !== '' && isEmbeddedLink(lastLine, embeddingOrigin)
  const text = endsWithEmbed ? trimmed : source
  const delimiter = trimmed === '' || endsWithEmbed ? '\n' : '\n\n'

  return (fileUrls: readonly string[]) =>
    [text, fileUrls.join('\n')].filter(Boolean).join(delimiter)
}
