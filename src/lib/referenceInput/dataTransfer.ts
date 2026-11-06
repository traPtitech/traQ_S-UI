import type { Editor } from '@tiptap/core'
import type { EditorProps, EditorView } from '@tiptap/pm/view'

import { embeddingOrigin } from '../apis'
import type { InputMode, InputPart, Reference } from '../references'
import { readClipboardData, writeClipboardData } from './clipboard'
import { editInput } from './editOperation'
import { contentToParts } from './editorDocument'
import { editorTextBetween } from './editorText'
import { pastedChannelLinks } from './pastedChannelLinks'
import { currentInputSelection } from './selection'

export type PastePlan =
  { type: 'handled' } | { type: 'text'; text: string | Promise<string> }

export type PreparePaste = (event: ClipboardEvent) => PastePlan | undefined

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
  preparePaste?: PreparePaste
}): NonNullable<EditorProps['handleDOMEvents']> => {
  const edit = (operation: () => void) => {
    const current = options.editor()
    if (!current || options.readonly()) return

    editInput(current, operation)
  }

  const copy = (view: EditorView, event: ClipboardEvent, cut: boolean) => {
    if (!event.clipboardData) return false

    const selection = currentInputSelection(view)
    if (selection.empty) return false

    writeClipboardData(
      event.clipboardData,
      contentToParts(selection.content().content),
      options.mode(),
      location.origin,
      options.label
    )

    event.preventDefault()

    if (cut && !options.readonly())
      edit(() =>
        view.dispatch(
          view.state.tr
            .setSelection(selection)
            .deleteSelection()
            .scrollIntoView()
        )
      )

    return true
  }

  return {
    copy: (view, event) => copy(view, event, false),
    cut: (view, event) => copy(view, event, true),

    paste: (view, event) => {
      const data = event.clipboardData

      if (!data || options.readonly()) return false

      const { doc } = view.state
      const { from, to } = currentInputSelection(view)
      const range = { from, to }

      const parts =
        readClipboardData(data, options.mode(), location.origin) ??
        (options.mode() === 'message' && !data.files?.length
          ? pastedChannelLinks(data.getData('text/plain'), {
              origins: [location.origin, embeddingOrigin],
              channelPathToId: options.channelPathToId,
              before: editorTextBetween(doc, 1, from),
              after: editorTextBetween(doc, to)
            })
          : undefined)

      if (parts) {
        event.preventDefault()
        edit(() => options.insertParts(parts, range))

        return true
      }

      const plan = options.preparePaste?.(event)
      if (plan) {
        event.preventDefault()
        if (plan.type === 'handled') return true

        const insert = (text: string) => {
          if (!text) return

          const current = options.editor()
          if (
            current &&
            !current.isDestroyed &&
            current.view === view &&
            view.state.doc === doc
          )
            edit(() => options.insertText(text, range))
        }

        if (typeof plan.text === 'string') insert(plan.text)
        else void plan.text.then(insert).catch(() => undefined)

        return true
      }

      event.preventDefault()
      const text = data.getData('text/plain')
      if (text) edit(() => options.insertText(text, range))

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
