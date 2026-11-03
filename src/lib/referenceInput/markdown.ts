import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

import {
  type MarkdownLineContext,
  markdownLineContexts
} from '../markdown/lineContexts'
import { createMarkdownParser } from '../markdown/parser'
import { type PositionedToken, trackMarkdownSource } from '../markdown/source'
import { markdownTableCellPositions } from '../markdown/tableSource'

type Range = { from: number; to: number }

type FormatBase = Range & { className: string; syntax: Range[]; content: Range }
type ContainerGuide = { quoteDepth: number; indent: number }
type RenderedSource = { type: 'markdown'; text: string }

type LiteralSource =
  | { type: 'math'; text: string; display: boolean }
  | { type: 'block'; text: string }

export type MarkdownFormat = FormatBase &
  (
    | {
        kind: 'inline-style' | 'literal'
        replacement?: never
        container?: never
      }
    | {
        kind: 'rendered-inline'
        replacement: RenderedSource
        container?: never
      }
    | { kind: 'source-only'; replacement: LiteralSource; container?: never }
    | { kind: 'container'; container: ContainerGuide; replacement?: never }
    | { kind: 'list-marker' | 'rule'; replacement: string; container?: never }
  )

export const isMarkdownSourceOnly = (format: MarkdownFormat) =>
  format.kind === 'source-only'

export type MarkdownAnalysis = {
  source: string
  tokens: Token[]
  lines: MarkdownLineContext[]
  formats: MarkdownFormat[]
}

let parser: ReturnType<typeof createMarkdownParser>['md'] | undefined

const getParser = () => {
  if (!parser) {
    parser = createMarkdownParser().md
    parser.use(trackMarkdownSource)

    // 表示可否の判定前の画像記法を、編集中は一つの原文範囲として扱う。
    const imageParser = new MarkdownIt().inline
    imageParser.ruler.enableOnly('image')
    const [image] = imageParser.ruler.getRules('')

    parser.inline.ruler.before('image', 'source_image', (state, silent) =>
      state.env.sourcePreview ? (image?.(state, silent) ?? false) : false
    )
  }

  return parser
}

const styles: Record<string, string | undefined> = {
  strong: 'strong',
  em: 'emphasis',
  s: 'strike',
  a: 'link',
  mark: 'highlight',
  span: 'spoiler'
}

let lastAnalysis: MarkdownAnalysis | undefined

export const analyzeMarkdown = (source: string): MarkdownAnalysis => {
  if (lastAnalysis?.source === source) return lastAnalysis

  if (!/[\r\0]/.test(source)) {
    const tokens = getParser().parse(source, { sourcePreview: true })
    const lines = markdownLineContexts(source, tokens)

    lastAnalysis = {
      source,
      tokens,
      lines,
      formats: collectFormats(source, tokens, lines)
    }

    return lastAnalysis
  }

  const positions: number[] = []

  const normalized = source.replace(
    /\r\n?|\0|[^\r\0]/g,
    (text: string, index: number) => {
      positions.push(index)
      return text[0] === '\r' ? '\n' : text === '\0' ? '\uFFFD' : text
    }
  )

  positions.push(source.length)
  const tokens = getParser().parse(normalized, { sourcePreview: true })
  const lines = markdownLineContexts(normalized, tokens)
  const formats = collectFormats(normalized, tokens, lines)

  const map = (range: Range): Range => ({
    from: positions[range.from] ?? NaN,
    to: positions[range.to] ?? NaN
  })

  lastAnalysis = {
    source,
    tokens,
    lines: lines.map(line => ({
      ...line,
      ...map(line),
      contentFrom: positions[line.contentFrom] ?? source.length,
      containers: line.containers.map(container => ({
        ...container,
        ...(container.marker ? { marker: map(container.marker) } : {})
      }))
    })),
    formats: formats.map(format => ({
      ...format,
      ...map(format),
      content: map(format.content),
      syntax: format.syntax.map(map)
    }))
  }

  return lastAnalysis
}

export const parseMarkdownLineContexts = (source: string) =>
  analyzeMarkdown(source).lines
export const markdownFormats = (source: string) =>
  analyzeMarkdown(source).formats

const collectFormats = (
  source: string,
  tokens: Token[],
  contexts: MarkdownLineContext[]
): MarkdownFormat[] => {
  const lines = source.split('\n')
  const starts: number[] = []
  let offset = 0

  for (const line of lines) {
    starts.push(offset)
    offset += line.length + 1
  }

  const lineStart = (line: number) => starts[line] ?? source.length
  const lineEnd = (line: number) => lineStart(line) + (lines[line]?.length ?? 0)
  const formats: MarkdownFormat[] = []
  const seen = new Set<string>()

  const add = (
    className: string,
    from: number,
    to: number,
    content: Range,
    syntax: Range[],
    replacement?: MarkdownFormat['replacement'],
    container?: MarkdownFormat['container']
  ) => {
    const key = `${className}:${from}:${to}:${content.from}:${content.to}`

    if (
      ![
        from,
        to,
        content.from,
        content.to,
        ...syntax.flatMap(range => [range.from, range.to])
      ].every(Number.isFinite) ||
      from < 0 ||
      to > source.length ||
      from > content.from ||
      content.from > content.to ||
      content.to > to ||
      syntax.some(
        range => range.from < from || range.from > range.to || range.to > to
      ) ||
      (from === to && !container) ||
      seen.has(key)
    )
      return

    seen.add(key)
    const base = { from, to, content, syntax, className }

    if (container) formats.push({ ...base, kind: 'container', container })
    else if (typeof replacement === 'string')
      formats.push({
        ...base,
        kind: className === 'rule' ? 'rule' : 'list-marker',
        replacement
      })
    else if (replacement?.type === 'markdown')
      formats.push({ ...base, kind: 'rendered-inline', replacement })
    else if (replacement)
      formats.push({ ...base, kind: 'source-only', replacement })
    else
      formats.push({
        ...base,
        kind:
          className === 'code' || className === 'code-block'
            ? 'literal'
            : 'inline-style'
      })
  }

  let inTable = false
  let cells: number[][] = []
  let column = 0

  for (const token of tokens) {
    if (token.type === 'table_close') {
      inTable = false

      continue
    }

    if (inTable && token.type === 'tr_open' && token.map) {
      const context = contexts[token.map[0]]

      cells = context
        ? markdownTableCellPositions(
            source.slice(context.contentFrom, context.to),
            context.contentFrom
          )
        : []

      column = 0
    }

    // セルの inline トークンには行位置がないため、行と列の順序で対応づける。
    const cell =
      inTable && token.type === 'inline' ? cells[column++] : undefined

    if (!token.map && !cell?.length) continue

    const [first, end] = token.map ?? [0, 0]
    const from = cell?.[0] ?? lineStart(first)
    const to = cell ? (cell.at(-1) ?? from) + 1 : lineEnd(end - 1)

    if (token.type === 'table_open') {
      add('table', from, to, { from, to }, [], {
        type: 'block',
        text: source.slice(from, to)
      })

      inTable = true
    } else if (token.type === 'inline' && token.children) {
      // 引用・リストの接頭辞やインデントを除かれた各行を、原文中の位置へ対応づける。
      const positions: number[] = cell ?? []

      if (!cell)
        positions.push(
          ...((token as PositionedToken).meta?.originalPositions ?? [])
        )

      if (positions.length !== token.content.length) continue
      const at = (position: number) => positions[position] ?? NaN
      const stack: PositionedToken[] = []

      for (const child of token.children as PositionedToken[]) {
        const range = child.meta?.source

        if (!range) continue

        if (
          child.type === 'image' ||
          (child.meta?.match && child.position !== undefined) ||
          child.type === 'math_inline'
        ) {
          const start = at(range.from)
          const finish = at(range.to - 1) + 1

          add(
            child.type === 'math_inline' ? 'math' : 'rendered',
            start,
            finish,
            { from: start, to: finish },
            [{ from: start, to: finish }],
            child.type === 'math_inline'
              ? { type: 'math', text: child.content, display: false }
              : { type: 'markdown', text: source.slice(start, finish) }
          )
        } else if (child.type === 'code_inline') {
          const start = at(range.from)
          const finish = at(range.to - 1) + 1
          const size = child.markup.length

          add(
            'code',
            start,
            finish,
            { from: start + size, to: finish - size },
            [
              { from: start, to: start + size },
              { from: finish - size, to: finish }
            ]
          )
        } else if (child.nesting === 1 && styles[child.tag]) {
          stack.push(child)
        } else if (child.nesting === -1 && styles[child.tag]) {
          const opening = stack.pop()
          const openingRange = opening?.meta?.source

          if (!opening || !openingRange || opening.tag !== child.tag) continue

          if (child.tag === 'a') {
            if (opening.info === 'auto') {
              const start = at(openingRange.from)
              const finish = at(openingRange.to - 1) + 1
              const bracketed = opening.markup === 'autolink'

              const body = {
                from: start + (bracketed ? 1 : 0),
                to: finish - (bracketed ? 1 : 0)
              }

              add(
                'link',
                start,
                finish,
                body,
                bracketed
                  ? [
                      { from: start, to: body.from },
                      { from: body.to, to: finish }
                    ]
                  : []
              )

              continue
            }

            const start = at(openingRange.from - 1)

            if (source[start] !== '[') continue

            const finish = at(range.to - 1) + 1
            const body = { from: at(openingRange.from), to: at(range.from) }

            add('link', start, finish, body, [
              { from: start, to: body.from },
              { from: body.to, to: finish }
            ])
          } else {
            const size = opening.markup.length

            const start = at(
              openingRange.from + (openingRange.markerWidth ?? size) - size
            )

            const finish = at(range.from + size - 1) + 1

            add(
              styles[child.tag] ?? '',
              start,
              finish,
              { from: start + size, to: finish - size },
              [
                { from: start, to: start + size },
                { from: finish - size, to: finish }
              ]
            )
          }
        }
      }
    } else if (token.type === 'heading_open') {
      const prefix = token.markup.startsWith('#')
        ? /#{1,6}(?:[ \t]+|$)/.exec(lines[first] ?? '')
        : null

      if (prefix) {
        const closing = /[ \t]+#+[ \t]*$/.exec(lines[first] ?? '')
        const contentStart = from + prefix.index + prefix[0].length

        const body = {
          from: contentStart,

          to:
            closing && from + closing.index >= contentStart
              ? from + closing.index
              : to
        }

        add(token.tag, from, to, body, [
          { from: from + prefix.index, to: body.from },
          ...(body.to < to ? [{ from: body.to, to }] : [])
        ])
      } else {
        const body = { from, to: lineEnd(end - 2) }
        add(token.tag, from, to, body, [{ from: body.to, to }])
      }
    } else if (token.type === 'math_block') {
      add('math-block', from, to, { from, to }, [{ from, to }], {
        type: 'math',
        text: token.content,
        display: true
      })
    } else if (token.type === 'fence') {
      const lastContext = contexts[end - 1]

      const last = lastContext
        ? source.slice(lastContext.contentFrom, lastContext.to)
        : ''

      const closed = last.trimStart().startsWith(token.markup)

      const body = {
        from: lineStart(first + 1),
        to: closed ? lineStart(end - 1) : to
      }

      add('code-block', from, to, body, [
        { from, to: body.from },
        ...(closed ? [{ from: body.to, to }] : [])
      ])
    } else if (token.type === 'code_block') {
      add('code-block', from, to, { from, to }, [])
    } else if (token.type === 'hr') {
      add('rule', from, to, { from, to }, [{ from, to }], '')
    }
  }

  for (const line of contexts) {
    if (!line.containers.length) continue

    const syntax = line.containers
      .filter(part => part.type === 'quote')
      .flatMap(part => (part.marker ? [part.marker] : []))

    add(
      line.quoteDepth ? 'quote' : 'list-item',
      line.from,
      line.to,
      { from: line.contentFrom, to: line.to },
      syntax,
      undefined,
      { quoteDepth: line.quoteDepth, indent: line.indent }
    )

    for (const part of line.containers) {
      if (part.type !== 'list' || !part.marker) continue

      add(
        'bullet',
        line.from,
        line.to,
        part.marker,
        [part.marker],
        source.slice(part.marker.from, part.marker.to)
      )
    }
  }

  return formats
}
