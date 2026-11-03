import { closeHistory } from '@tiptap/pm/history'
import { type EditorState, TextSelection } from '@tiptap/pm/state'

import { analyzeMarkdownSource } from '../markdown/analysis'
import {
  editorSource,
  toDocumentPosition,
  toSourceOffset
} from './editorSource'
import {
  type MarkdownListCompletion,
  markdownListInputKey
} from './markdownListInput'

export type MarkdownLineBreakOptions = { continueItem?: boolean }

const nextListMarker = (marker: string, child = false) => {
  const ordered = /^(\d+)([.)])$/.exec(marker)

  if (!ordered) return marker

  const number = child ? 1 : Math.min(999999999, Number(ordered[1]) + 1)

  return `${number}${ordered[2]}`
}

/** 改行と接頭辞の補助を同じトランザクションにまとめ、参照ノードはそのまま残す。 */
export const markdownLineBreak = (
  state: EditorState,
  options: MarkdownLineBreakOptions = {}
) => {
  const transaction = closeHistory(state.tr)
  const { from, to, empty } = state.selection
  let begin = from
  let end = to
  let text = '\n'
  let completion: MarkdownListCompletion | undefined

  if (empty && state.selection instanceof TextSelection) {
    const source = editorSource(state.doc)

    const position = toSourceOffset(from)
    const start =
      position === 0 ? 0 : source.lastIndexOf('\n', position - 1) + 1
    const next = source.indexOf('\n', position)
    const finish = next === -1 ? source.length : next
    const line = source.slice(start, finish)

    // 空の継続行はトークンの末尾から外れることがあるため、入力位置に仮の本文を置いて調べる。
    const probe = /^[ \t]*$/.test(line)
      ? source.slice(0, position) + '\uFFFC' + source.slice(position)
      : source

    const context = analyzeMarkdownSource(probe).lines.find(
      line => line.from === start
    )

    if (context?.containers.length && position >= context.contentFrom) {
      const continuation = context.containers.map(part => part.continuation)

      const body = source.slice(context.contentFrom, finish)
      const last = context.containers.at(-1)
      const continueItem = options.continueItem && last?.type === 'list'

      if (!context.literal && body.trim() === '' && !continueItem) {
        const outer = continuation.slice(0, -1).join('')
        begin = toDocumentPosition(start)
        end = toDocumentPosition(finish)
        text = outer + '\n' + outer
      } else {
        if (!context.literal && last?.list && !continueItem) {
          const outer = continuation.slice(0, -1).join('')
          const { marker, leading, spacing } = last.list
          const prefix = outer + leading + nextListMarker(marker) + spacing
          text += prefix

          if (source.slice(position, finish).trim() === '') {
            completion = {
              from: begin + 1,
              to: begin + text.length,
              text: prefix,
              continuation: continuation.join(''),
              child:
                continuation.join('') + nextListMarker(marker, true) + spacing
            }
          }
        } else {
          text += continuation.join('')
        }

        if (context.literal) text += /^[ \t]*/.exec(body)?.[0] ?? ''
      }
    }
  }

  transaction.insertText(text, begin, end)

  transaction.setSelection(
    TextSelection.create(transaction.doc, begin + text.length)
  )

  if (completion) transaction.setMeta(markdownListInputKey, completion)

  return transaction.scrollIntoView()
}
