import type MarkdownIt from 'markdown-it'
import type { RuleBlock } from 'markdown-it/lib/parser_block.mjs'
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'

const linePositions = (state: StateBlock, begin: number, end: number) => {
  const positions: number[] = []

  for (let line = begin; line < end; line++) {
    const start = state.bMarks[line] ?? 0
    const last = (state.eMarks[line] ?? start) + (line + 1 < end ? 1 : 0)
    let first = start
    let indent = 0

    while (first < last && indent < state.blkIndent) {
      const char = state.src[first]

      if (char === '\t')
        indent += 4 - ((indent + (state.bsCount[line] ?? 0)) % 4)
      else if (char === ' ' || first - start < (state.tShift[line] ?? 0))
        indent++
      else break

      first++
    }

    for (let i = state.blkIndent; i < indent; i++) positions.push(first - 1)
    for (let i = first; i < last; i++) positions.push(i)
  }

  return positions
}

/** markdown-it 14 の getLines による接頭辞除去・タブ展開を原文へ対応づける。 */
export const trackBlockSource = (parser: MarkdownIt) => {
  const getRules = parser.block.ruler.getRules.bind(parser.block.ruler)
  const wrappers = new WeakMap<RuleBlock, RuleBlock>()

  parser.block.ruler.getRules = chain =>
    getRules(chain).map(rule => {
      let wrapped = wrappers.get(rule)

      if (!wrapped) {
        wrapped = (state, start, end, silent) => {
          const count = state.tokens.length
          const matched = rule(state, start, end, silent)
          if (!matched || silent) return matched

          for (let i = count; i < state.tokens.length; i++) {
            const token = state.tokens[i]

            if (token?.type === 'fence' && token.map) {
              const bodyLines =
                token.content.split('\n').length -
                (token.content.endsWith('\n') || token.content === '' ? 1 : 0)
              const closingLine = token.map[0] + 1 + bodyLines

              if (closingLine < token.map[1])
                token.meta = { ...token.meta, fenceClosingLine: closingLine }
            }

            if (
              token?.type !== 'inline' ||
              !token.map ||
              token.meta?.originalPositions
            )
              continue

            const [first, last] = token.map
            const text = state.getLines(first, last, state.blkIndent, false)
            const positions = linePositions(state, first, last)
            const heading = state.tokens[i - 1]

            const offset =
              heading?.type === 'heading_open' && heading.markup.startsWith('#')
                ? text.indexOf(
                    token.content,
                    text.indexOf(heading.markup) + heading.markup.length
                  )
                : text.indexOf(token.content)

            if (offset >= 0)
              token.meta = {
                ...token.meta,
                originalPositions: positions.slice(
                  offset,
                  offset + token.content.length
                )
              }
          }

          return matched
        }

        wrappers.set(rule, wrapped)
      }

      return wrapped
    })
}
