import type { Editor } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'

export const editInput = (
  editor: Editor,
  operation: () => void,
  history: 'isolated' | 'typing' = 'isolated'
) => {
  if (editor.isDestroyed) return

  if (history === 'isolated') {
    editor.view.dispatch(closeHistory(editor.state.tr))
  }

  operation()

  if (history === 'isolated' && !editor.isDestroyed) {
    editor.view.dispatch(closeHistory(editor.state.tr))
  }
}
