import type { KeyboardShortcutCommand } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'

import { isComposingKeyEvent } from '../dom/keyboard'

export const isComposingInput = (
  view: Pick<EditorView, 'composing'>,
  event?: InputEvent | KeyboardEvent,
  pending?: () => boolean
) =>
  view.composing ||
  !!pending?.() ||
  !!event?.isComposing ||
  (event instanceof KeyboardEvent && isComposingKeyEvent(event))

export const compositionSafeShortcuts = (
  shortcuts: Record<string, KeyboardShortcutCommand>,
  pending?: () => boolean
): Record<string, KeyboardShortcutCommand> =>
  Object.fromEntries(
    Object.entries(shortcuts).map(([key, command]) => [
      key,
      props =>
        !isComposingInput(props.editor.view, undefined, pending) &&
        command(props)
    ])
  )
