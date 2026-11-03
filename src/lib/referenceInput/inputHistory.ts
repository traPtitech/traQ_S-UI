import { Extension } from '@tiptap/core'
import { history, redo, undo } from '@tiptap/pm/history'

import { compositionSafeShortcuts } from './composition'

export const inputHistory = history()

export const inputHistoryExtension = (isComposing?: () => boolean) =>
  Extension.create({
    name: 'inputHistory',
    addProseMirrorPlugins: () => [inputHistory],

    addKeyboardShortcuts() {
      return compositionSafeShortcuts(
        {
          'Mod-z': () => undo(this.editor.state, this.editor.view.dispatch),
          'Mod-Shift-z': () =>
            redo(this.editor.state, this.editor.view.dispatch),
          'Mod-y': () => redo(this.editor.state, this.editor.view.dispatch)
        },
        isComposing
      )
    }
  })
