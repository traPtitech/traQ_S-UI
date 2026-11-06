import {
  type EditorState,
  TextSelection,
  type Transaction
} from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import type { SourceRange } from '../markdown/types'
import {
  toDocumentPosition,
  toDocumentRange,
  toSourceOffset
} from './editorSource'
import type { MarkdownFormat } from './markdown'
import { currentInputSelection } from './selection'

export type MarkdownEditingState = {
  enabled: boolean
  focused: boolean
  composing: boolean
  formats: readonly MarkdownFormat[]
  revealed: SourceRange[]
}

type SourceEdit = { transaction: Transaction; revealed?: SourceRange[] }
type Direction = 'backward' | 'forward'

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

const containsRange = (first: SourceRange, second: SourceRange) =>
  first.from <= second.from && first.to >= second.to

export const markdownSourceActive = (
  preview: MarkdownEditingState,
  selection: EditorState['selection'],
  format: MarkdownFormat
) =>
  preview.focused &&
  ((selection.empty
    ? selection.from > toDocumentPosition(format.from) &&
      selection.to < toDocumentPosition(format.to)
    : selection.from < toDocumentPosition(format.to) &&
      selection.to > toDocumentPosition(format.from)) ||
    (selection.from >= toDocumentPosition(format.from) &&
      selection.to <= toDocumentPosition(format.to) &&
      preview.revealed.some(range => containsRange(range, format))))

export const markdownSourceRangesAt = (
  formats: readonly MarkdownFormat[],
  position: number
) =>
  formats
    .filter(
      format =>
        format.kind === 'rendered-inline' &&
        position >= toDocumentPosition(format.from) &&
        position <= toDocumentPosition(format.to)
    )
    .map(({ from, to }) => ({ from, to }))

export const markdownSourceVisible = (
  preview: MarkdownEditingState,
  selection: EditorState['selection'],
  format: MarkdownFormat
) =>
  format.kind !== 'rendered-inline' ||
  markdownSourceActive(preview, selection, format)

export const retainMarkdownSource = (
  previous: MarkdownEditingState,
  oldState: EditorState,
  transaction: Transaction
): SourceRange[] => {
  // 原文を置換して表示する装飾だけを保持し、親の引用や表から別のセルまで開かない。
  const opened = previous.revealed.concat(
    previous.formats.filter(
      format =>
        format.kind === 'rendered-inline' &&
        markdownSourceActive(previous, oldState.selection, format)
    )
  )

  const retained: SourceRange[] = []

  for (const range of opened) {
    const documentRange = toDocumentRange(range)
    const from = transaction.mapping.mapResult(documentRange.from, 1)
    const to = transaction.mapping.mapResult(documentRange.to, -1)

    if (from.deletedAcross || to.deletedAcross || (from.deleted && to.deleted))
      continue

    const mapped = {
      ...range,
      from: toSourceOffset(from.pos),
      to: toSourceOffset(to.pos)
    }

    if (
      transaction.selection.from < from.pos ||
      transaction.selection.to > to.pos ||
      retained.some(range => containsRange(range, mapped))
    )
      continue

    retained.push(mapped)
  }

  return retained
}

/** Markdown の境界でも、原文に対応する見える位置へカーソルを置く。 */
export const restoreMarkdownSourceCaret = (view: EditorView) => {
  if (
    !view.hasFocus() ||
    !(view.state.selection instanceof TextSelection) ||
    !view.state.selection.empty
  )
    return

  const selection = view.dom.ownerDocument.getSelection()

  if (!selection || !selection.isCollapsed) return

  const position = view.state.selection.head
  let point = view.domAtPos(position, 1)

  const previous =
    point.node instanceof Element
      ? point.node.childNodes[point.offset - 1]
      : point.offset === 0
        ? point.node.previousSibling
        : undefined

  if (
    previous instanceof Element &&
    previous.classList.contains('markdown-input-source')
  ) {
    point = view.domAtPos(position, -1)
  }

  const element =
    point.node instanceof Element ? point.node : point.node.parentElement

  let hidden = element?.closest('.markdown-input-hidden')

  while (hidden?.parentElement?.closest('.markdown-input-hidden')) {
    hidden = hidden.parentElement.closest('.markdown-input-hidden')
  }

  if (hidden && view.dom.contains(hidden) && hidden.parentNode) {
    const start = view.posAtDOM(hidden, 0)
    const end = view.posAtDOM(hidden, hidden.childNodes.length)

    if (position !== start && position !== end) return

    const offset = Array.prototype.indexOf.call(
      hidden.parentNode.childNodes,
      hidden
    ) as number

    point = {
      node: hidden.parentNode,
      offset: offset + (position === end ? 1 : 0)
    }
  }

  if (
    selection.anchorNode !== point.node ||
    selection.anchorOffset !== point.offset
  ) {
    selection.collapse(point.node, point.offset)
  }
}

const adjacentPosition = (
  state: EditorState,
  position: number,
  direction: Direction
) => {
  const resolved = state.doc.resolve(position)

  const node =
    direction === 'backward' ? resolved.nodeBefore : resolved.nodeAfter

  if (!node) return position

  if (!node.isText)
    return direction === 'backward'
      ? position - node.nodeSize
      : position + node.nodeSize

  const segments = graphemes.segment(node.text ?? '')

  const length =
    direction === 'backward'
      ? ([...segments].at(-1)?.segment.length ?? 0)
      : (segments[Symbol.iterator]().next().value?.segment.length ?? 0)

  return direction === 'backward' ? position - length : position + length
}

/** 非表示の記号を飛ばさず、原文の先頭・末尾へ入り直す。 */
export const enterMarkdownSource = (
  state: EditorState,
  preview: MarkdownEditingState,
  direction: Direction,
  extend: boolean
): SourceEdit | undefined => {
  if (
    !(state.selection instanceof TextSelection) ||
    (!state.selection.empty && !extend)
  )
    return

  const head = state.selection.head
  const adjacent = adjacentPosition(state, head, direction)

  const edge = (format: MarkdownFormat) =>
    direction === 'backward'
      ? toDocumentPosition(format.to)
      : toDocumentPosition(format.from)

  const format = preview.formats.find(
    format =>
      !markdownSourceVisible(preview, state.selection, format) &&
      (edge(format) === head || edge(format) === adjacent)
  )

  if (format?.kind !== 'rendered-inline') return

  const position = extend ? adjacent : edge(format)

  // スタンプの境界に着くだけの移動では、プレビューを維持する。
  const reveal =
    extend || format.replacement.type !== 'stamp' || head === position

  return {
    transaction: state.tr
      .setSelection(
        TextSelection.create(
          state.doc,
          extend ? state.selection.anchor : position,
          position
        )
      )
      .scrollIntoView(),

    revealed: reveal
      ? markdownSourceRangesAt(preview.formats, position)
      : undefined
  }
}

/** DOM の可視範囲ではなく、原文上の選択範囲を削除する。 */
export const deleteMarkdownSource = (
  view: EditorView,
  preview: MarkdownEditingState,
  direction: Direction
): SourceEdit | undefined => {
  let state = view.state
  if (!(state.selection instanceof TextSelection)) return

  const selection = currentInputSelection(view)

  if (!(selection instanceof TextSelection)) return

  // Undo が削除前の DOM 選択位置を保存するよう、編集とは別に同期する。
  if (!selection.eq(state.selection)) {
    view.dispatch(state.tr.setSelection(selection))
    state = view.state
  }

  const transaction = state.tr

  if (!selection.empty)
    return { transaction: transaction.deleteSelection().scrollIntoView() }

  const position = selection.head

  const edge = (format: MarkdownFormat) =>
    direction === 'backward'
      ? toDocumentPosition(format.to)
      : toDocumentPosition(format.from)

  const boundary = preview.formats.find(
    format =>
      edge(format) === position &&
      !markdownSourceVisible(preview, selection, format)
  )

  // スタンプは最初の Backspace で終端の : を削除して原文へ戻す。
  const deletesStampColon =
    direction === 'backward' &&
    boundary?.kind === 'rendered-inline' &&
    boundary.replacement.type === 'stamp'

  if (boundary && !deletesStampColon)
    return {
      transaction: transaction.scrollIntoView(),
      revealed: markdownSourceRangesAt(preview.formats, position)
    }

  const resolved = state.doc.resolve(position)

  const node =
    direction === 'backward' ? resolved.nodeBefore : resolved.nodeAfter

  if (!node?.isText) {
    // メンションの再編集などは既存の参照ノードの操作へ引き継ぐ。
    return
  }

  const adjacent = adjacentPosition(state, position, direction)

  if (adjacent === position) return

  const from = Math.min(position, adjacent)
  const to = Math.max(position, adjacent)
  transaction.delete(from, to)
  transaction.setSelection(TextSelection.create(transaction.doc, from))

  return { transaction: transaction.scrollIntoView() }
}
