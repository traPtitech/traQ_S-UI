import type { Editor } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'
import type { EditorProps } from '@tiptap/pm/view'

import { embeddingOrigin } from '../apis'
import { readClipboardData, writeClipboardData } from './clipboard'
import type { InputMode, InputPart, Reference } from './document'
import { contentToParts } from './editorDocument'
import { pastedChannelLinks } from './pastedChannelLinks'

export const inputDataTransfer = (options: {
  editor: () => Editor | undefined
  readonly: () => boolean
  mode: () => InputMode
  label: (reference: Reference) => string
  channelPathToId: (path: string) => string | undefined
  insertParts: (
    parts: InputPart[],
    range?: { from: number; to: number }
  ) => void
  insertText: (text: string, range?: { from: number; to: number }) => void
  onPaste: (event: ClipboardEvent) => void
}): NonNullable<EditorProps['handleDOMEvents']> => {
  const edit = (operation: () => void) => {
    const current = options.editor()
    if (!current || options.readonly()) return
    current.view.dispatch(closeHistory(current.state.tr))
    operation()
    current.view.dispatch(closeHistory(current.state.tr))
  }

  const copy = (event: ClipboardEvent, cut: boolean) => {
    const current = options.editor()

    if (!current || !event.clipboardData || current.state.selection.empty)
      return false

    const parts = contentToParts(current.state.selection.content().content)

    writeClipboardData(
      event.clipboardData,
      parts,
      options.mode(),
      location.origin,
      options.label
    )

    event.preventDefault()

    if (cut && !options.readonly())
      edit(() => current.commands.deleteSelection())

    return true
  }

  return {
    copy: (_view, event) => copy(event, false),
    cut: (_view, event) => copy(event, true),

    paste: (view, event) => {
      const data = event.clipboardData

      if (!data || options.readonly()) return false

      const { doc, selection } = view.state

      const parts =
        readClipboardData(data, options.mode(), location.origin) ??
        (options.mode() === 'message' && !data.files?.length
          ? pastedChannelLinks(data.getData('text/plain'), {
              origins: [location.origin, embeddingOrigin],
              channelPathToId: options.channelPathToId,
              before: doc.textBetween(1, selection.from, '', '\uFFFC'),
              after: doc.textBetween(
                selection.to,
                doc.content.size - 1,
                '',
                '\uFFFC'
              )
            })
          : undefined)

      if (parts) {
        event.preventDefault()
        edit(() => options.insertParts(parts))

        return true
      }

      options.onPaste(event)

      if (event.defaultPrevented) return true

      event.preventDefault()
      edit(() => options.insertText(data.getData('text/plain')))

      return true
    },

    drop: (view, event) => {
      if (
        view.dragging ||
        options.readonly() ||
        !event.dataTransfer?.types.includes('text/plain')
      )
        return false

      const position = view.posAtCoords({
        left: event.clientX,
        top: event.clientY
      })?.pos

      if (position === undefined) return false
      const range = { from: position, to: position }
      event.preventDefault()

      const parts = readClipboardData(
        event.dataTransfer,
        options.mode(),
        location.origin
      )

      if (parts) edit(() => options.insertParts(parts, range))
      else {
        const text = event.dataTransfer.getData('text/plain')
        edit(() => options.insertText(text, range))
      }

      return true
    }
  }
}
