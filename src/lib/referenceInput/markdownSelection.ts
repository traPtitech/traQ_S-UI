import { TextSelection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

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
