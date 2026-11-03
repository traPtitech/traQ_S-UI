import type Token from 'markdown-it/lib/token.mjs'

type Range = Readonly<{ from: number; to: number }>

type ListMarker = Readonly<{ marker: string; leading: string; spacing: string }>

type Container = {
  type: 'quote' | 'list'
  first: number
  end: number
  markup: string
  continuation: string
  width: number
  list?: ListMarker
}

export type MarkdownLineContext = Range &
  Readonly<{
    contentFrom: number
    containers: ReadonlyArray<
      Readonly<{
        type: Container['type']
        continuation: string
        marker?: Range
        list?: ListMarker
      }>
    >
    quoteDepth: number
    indent: number
    literal: boolean
  }>

const columns = (text: string, start = 0) => {
  let width = start

  for (const char of text) width += char === '\t' ? 4 - (width % 4) : 1

  return width - start
}

const skipIndent = (
  line: string,
  start: number,
  width: number,
  column: number
) => {
  let end = start
  let consumed = 0

  while (consumed < width && /[ \t]/.test(line[end] ?? '')) {
    consumed += line[end] === '\t' ? 4 - ((column + consumed) % 4) : 1
    end++
  }

  return end
}

/** コンテナの範囲はパーサーから取得し、実在する接頭辞だけを原文の位置へ対応づける。 */
export const markdownLineContexts = (
  source: string,
  tokens: readonly Token[]
): MarkdownLineContext[] => {
  const containers = tokens.flatMap<Container>(token =>
    token.map &&
    (token.type === 'blockquote_open' || token.type === 'list_item_open')
      ? [
          {
            type: token.type === 'blockquote_open' ? 'quote' : 'list',
            first: token.map[0],
            end: token.map[1],
            markup: token.markup,
            continuation: '',
            width: 0
          }
        ]
      : []
  )

  const starts = new Map<number, Container[]>()

  for (const container of containers) {
    const group = starts.get(container.first) ?? []
    group.push(container)
    starts.set(container.first, group)
  }

  const literalEvents = new Map<number, number>()

  for (const token of tokens) {
    if (
      !token.map ||
      !['fence', 'code_block', 'math_block'].includes(token.type)
    )
      continue

    for (const [line, delta] of [
      [token.map[0], 1],
      [token.map[1], -1]
    ] as const)
      literalEvents.set(line, (literalEvents.get(line) ?? 0) + delta)
  }

  let active: Container[] = []
  let literalDepth = 0
  let from = 0

  return source.split('\n').map((line, index) => {
    active = active
      .filter(container => index < container.end)
      .concat(starts.get(index) ?? [])

    literalDepth += literalEvents.get(index) ?? 0
    let cursor = 0
    let indent = 0
    const parts: Array<MarkdownLineContext['containers'][number]> = []

    for (const container of active) {
      const start = cursor
      const column = columns(line.slice(0, start))
      let marker: Range | undefined

      if (container.type === 'quote') {
        const prefix = /^ {0,3}>[ \t]?/.exec(line.slice(cursor))?.[0]

        if (prefix) {
          cursor += prefix.length
          marker = { from: from + start, to: from + cursor }
        }

        if (index === container.first) {
          container.continuation = prefix ?? '> '
          container.width = columns(container.continuation, column)
        }
      } else if (index === container.first) {
        const prefix = /^([ \t]*)([-+*]|\d+[.)])([ \t]+|$)/.exec(
          line.slice(cursor)
        )

        const symbol = prefix?.[2]

        if (prefix && symbol?.endsWith(container.markup)) {
          const before = prefix[1] ?? ''
          const whitespace = prefix[3] ?? ''
          const markerStart = cursor + before.length
          const markerEnd = markerStart + symbol.length
          const markerColumn = columns(line.slice(0, markerEnd))
          const after = columns(whitespace, markerColumn)
          const padding = after === 0 || after > 4 ? 1 : after

          cursor = skipIndent(line, markerEnd, padding, markerColumn)
          marker = { from: from + markerStart, to: from + markerEnd }
          container.width = columns(before + symbol, column) + padding
          container.continuation = ' '.repeat(container.width)

          container.list = {
            marker: symbol,
            leading: before,
            spacing: line.slice(markerEnd, cursor) || ' '
          }
        }
      } else {
        cursor = skipIndent(line, cursor, container.width, column)
      }

      indent += Math.max(
        0,
        container.width - columns(line.slice(start, cursor), column)
      )

      parts.push({
        type: container.type,
        continuation: container.continuation,
        marker,
        list: container.list
      })
    }

    const context: MarkdownLineContext = {
      from,
      to: from + line.length,
      contentFrom: from + cursor,
      containers: parts,
      quoteDepth: parts.filter(part => part.type === 'quote').length,
      indent,
      literal: literalDepth > 0
    }

    from += line.length + 1

    return context
  })
}
