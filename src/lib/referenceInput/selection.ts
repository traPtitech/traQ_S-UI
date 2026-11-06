import { type Selection, TextSelection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

export const currentInputSelection = (view: EditorView) => {
  const { doc, selection } = view.state
  const native = view.dom.ownerDocument.getSelection()
  const anchorNode = native?.anchorNode
  const focusNode = native?.focusNode

  // selectionchange が届く前に編集操作が発生することがある。
  if (
    !native ||
    !anchorNode ||
    !focusNode ||
    !view.dom.contains(anchorNode) ||
    !view.dom.contains(focusNode)
  )
    return selection

  const anchor = view.posAtDOM(anchorNode, native.anchorOffset)
  const head = view.posAtDOM(focusNode, native.focusOffset)

  if (anchor === selection.anchor && head === selection.head) return selection

  return TextSelection.between(doc.resolve(anchor), doc.resolve(head))
}

export const syncInputSelection = (
  view: EditorView,
  selection: Selection = currentInputSelection(view)
) => {
  // 編集前に同期し、Undo にも DOM の選択位置を保存する。
  if (!selection.eq(view.state.selection))
    view.dispatch(view.state.tr.setSelection(selection))

  return view.state
}
