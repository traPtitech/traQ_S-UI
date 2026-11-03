import mathPlugin from '@traptitech/markdown-it-katex'

import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

import {
  type InputPart,
  inputText,
  parseInput,
  serializeInput
} from './document'

let contextParser: MarkdownIt | undefined

const protectedTokenTypes = new Set([
  'fence',
  'code_block',
  'code_inline',
  'math_block',
  'math_inline'
])

export const normalizeMessageParts = (
  parts: readonly InputPart[]
): InputPart[] => {
  if (!parts.some(part => part.type === 'reference')) return [...parts]

  // 引用やリストの接頭辞が取り除かれてもマーカーが残るようにする。
  // 通常のテキストを参照と誤認しないよう、原文に含まれない接頭辞を使う。
  let prefix = '\uE000'
  const text = inputText(parts)
  while (text.includes(prefix)) prefix += '\uE000'

  const marked = parts
    .map((part, index) =>
      part.type === 'text' ? part.text : `${prefix}${index}\uE001`
    )
    .join('')

  const protectedIndexes = new Set<number>()
  const marker = new RegExp(`${prefix}(\\d+)\uE001`, 'g')

  const collect = (tokens: Token[]) => {
    for (const token of tokens) {
      if (protectedTokenTypes.has(token.type)) {
        for (const match of (token.content + token.info).matchAll(marker))
          protectedIndexes.add(Number(match[1]))
      }

      if (token.children) collect(token.children)
    }
  }

  contextParser ??= new MarkdownIt().use(mathPlugin, {})
  collect(contextParser.parse(marked, {}))

  return parts.map((part, index) =>
    protectedIndexes.has(index) && part.type === 'reference'
      ? { type: 'text', text: part.reference.raw }
      : part
  )
}

export const messageContent = (source: string) =>
  serializeInput(normalizeMessageParts(parseInput(source, 'message')))
