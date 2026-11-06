// Syntax rules adapted from @traptitech/markdown-it-katex 3.6.0.
// Copyright (c) 2016 Waylon Flinn, 2018 Takahiro Ethan Ikeuchi. See mathSyntax.LICENSE.
import type MarkdownIt from 'markdown-it'
import type { RuleBlock } from 'markdown-it/lib/parser_block.mjs'
import type { RuleInline } from 'markdown-it/lib/parser_inline.mjs'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs'

const delimiter = (state: StateInline, position: number) => {
  const previous = position > 0 ? state.src.charCodeAt(position - 1) : -1
  const next =
    position + 1 <= state.posMax ? state.src.charCodeAt(position + 1) : -1

  return {
    open: next !== 0x20 && next !== 0x09,
    close:
      previous !== 0x20 && previous !== 0x09 && !(next >= 0x30 && next <= 0x39)
  }
}

const inlineMath: RuleInline = (state, silent) => {
  if (state.src[state.pos] !== '$') return false

  if (!delimiter(state, state.pos).open) {
    if (!silent) state.pending += '$'
    state.pos++
    return true
  }

  const start = state.pos + 1
  let match = start

  while ((match = state.src.indexOf('$', match)) !== -1) {
    let position = match - 1
    while (state.src[position] === '\\') position--
    if ((match - position) % 2 === 1) break
    match++
  }

  if (match === -1) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }

  if (match === start) {
    if (!silent) state.pending += '$$'
    state.pos = start + 1
    return true
  }

  if (!delimiter(state, match).close) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }

  if (!silent) {
    const token = state.push('math_inline', 'math', 0)
    token.markup = '$'
    token.content = state.src.slice(start, match)
  }

  state.pos = match + 1
  return true
}

const blockMath: RuleBlock = (state, start, end, silent) => {
  let position = (state.bMarks[start] ?? 0) + (state.tShift[start] ?? 0)
  let max = state.eMarks[start] ?? 0
  if (position + 2 > max || state.src.slice(position, position + 2) !== '$$')
    return false

  position += 2
  let firstLine = state.src.slice(position, max)
  if (silent) return true

  let found = firstLine.trim().endsWith('$$')
  if (found) firstLine = firstLine.trim().slice(0, -2)

  let next = start
  let lastLine = ''

  while (!found) {
    next++
    if (next >= end) break

    position = (state.bMarks[next] ?? 0) + (state.tShift[next] ?? 0)
    max = state.eMarks[next] ?? 0
    if (position < max && (state.tShift[next] ?? 0) < state.blkIndent) break

    if (state.src.slice(position, max).trim().endsWith('$$')) {
      const lastPosition = state.src.slice(0, max).lastIndexOf('$$')
      lastLine = state.src.slice(position, lastPosition)
      found = true
    }
  }

  state.line = next + 1
  const token = state.push('math_block', 'math', 0)
  token.block = true
  token.content =
    (firstLine.trim() ? firstLine + '\n' : '') +
    state.getLines(start + 1, next, state.tShift[start] ?? 0, true) +
    (lastLine.trim() ? lastLine : '')
  token.map = [start, state.line]
  token.markup = '$$'
  return true
}

export const mathSyntax = (parser: MarkdownIt) => {
  parser.inline.ruler.after('escape', 'math_inline', inlineMath)
  parser.block.ruler.after('blockquote', 'math_block', blockMath, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })
}
