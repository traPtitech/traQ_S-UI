import { TextSelection } from '@tiptap/pm/state'
import type { EditorProps, EditorView } from '@tiptap/pm/view'

import { isComposingInput } from './composition'
import { toDocumentPosition } from './editorCoordinates'
import { deleteMarkdownSource, enterMarkdownSource } from './markdownEditing'
import { type PreviewState, markdownPreviewKey } from './markdownPreviewState'
import { currentInputSelection, syncInputSelection } from './selection'

const acceptsPreviewPointer = (view: EditorView, event: MouseEvent) => {
  const preview = markdownPreviewKey.getState(view.state)

  return (
    preview?.enabled &&
    view.editable &&
    !preview.composing &&
    !view.composing &&
    event.button === 0 &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  )
}

const clickedWidget = (view: EditorView, event: MouseEvent) => {
  if (!acceptsPreviewPointer(view, event)) return

  const widget =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>('.markdown-input-rendered')
      : null

  return widget && view.dom.contains(widget) ? widget : undefined
}

const deleteAtInputSelection = (
  view: EditorView,
  preview: PreviewState,
  direction: 'backward' | 'forward'
) =>
  view.state.selection instanceof TextSelection
    ? deleteMarkdownSource(syncInputSelection(view), preview, direction)
    : undefined

export const markdownPreviewEvents: EditorProps = {
  handleClick: (view, position, event) => {
    const preview = markdownPreviewKey.getState(view.state)
    if (!preview || !acceptsPreviewPointer(view, event)) return false

    // Chromium は原文が隠れていると、直後の空白も装飾の先頭に割り当てる。
    let caret = position

    for (const widget of view.dom.querySelectorAll(
      '.markdown-input-rendered'
    )) {
      if (view.posAtDOM(widget, 0) !== caret) continue

      const format = preview.formats.find(
        format =>
          format.kind === 'rendered-inline' &&
          toDocumentPosition(format.from) === caret
      )
      if (!format) continue

      // 画像がインラインの span より高い場合も、行の上下までクリックを拾う。
      const box = (
        widget.querySelector('img') ?? widget
      ).getBoundingClientRect()
      const { direction, lineHeight } = getComputedStyle(widget)
      const padding = Math.max(
        0,
        ((Number.parseFloat(lineHeight) || 0) - box.height) / 2
      )

      if (
        event.clientY < Math.floor(box.top - padding) ||
        event.clientY > Math.ceil(box.bottom + padding)
      )
        continue

      if (
        direction === 'rtl'
          ? event.clientX > box.left
          : event.clientX < box.right
      )
        continue

      caret = toDocumentPosition(format.to)
    }

    if (caret === position) return false

    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, caret))
    )
    view.focus()
    return true
  },

  handleKeyDown: (view, event) => {
    const preview = markdownPreviewKey.getState(view.state)

    if (
      !preview?.enabled ||
      !view.editable ||
      isComposingInput(view, event, () => preview.composing) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return false

    const result =
      event.key === 'ArrowLeft' || event.key === 'ArrowRight'
        ? enterMarkdownSource(
            view.state,
            preview,
            event.key === 'ArrowLeft' ? 'backward' : 'forward',
            event.shiftKey
          )
        : !event.shiftKey &&
            (event.key === 'Backspace' || event.key === 'Delete')
          ? deleteAtInputSelection(
              view,
              preview,
              event.key === 'Backspace' ? 'backward' : 'forward'
            )
          : undefined

    if (!result) return false

    return applyMarkdownEdit(view, event, result)
  },

  handleDOMEvents: {
    mousedown: (view, event) => {
      if (!clickedWidget(view, event)) return false

      event.preventDefault()
      return true
    },

    click: (view, event) => {
      const widget = clickedWidget(view, event)
      if (!widget) return false

      const position = view.posAtDOM(widget, 0)
      const preview = markdownPreviewKey.getState(view.state)
      const format = preview?.formats.find(
        format =>
          format.kind === 'rendered-inline' &&
          toDocumentPosition(format.content.from) === position
      )

      if (!format) return false

      const { left, width } = widget.getBoundingClientRect()
      const rtl = getComputedStyle(widget).direction === 'rtl'
      const rightHalf = event.clientX >= left + width / 2
      const after = event.detail > 0 && rightHalf !== rtl
      const caret = toDocumentPosition(after ? format.to : format.from)

      view.dispatch(
        view.state.tr
          .setSelection(TextSelection.create(view.state.doc, caret))
          .setMeta(markdownPreviewKey, {
            revealed: [{ from: format.from, to: format.to }]
          })
      )
      view.focus()
      event.preventDefault()

      return true
    },

    beforeinput: (view, event) => {
      const preview = markdownPreviewKey.getState(view.state)

      if (
        !preview?.enabled ||
        !view.editable ||
        isComposingInput(view, event, () => preview.composing) ||
        !event.cancelable
      )
        return false

      if (
        event.inputType === 'insertText' &&
        event.data !== null &&
        view.state.selection.from >= 1 &&
        view.state.selection.to < view.state.doc.content.size
      ) {
        // クリック直後は選択範囲の通知より beforeinput が先に届くことがある。
        const target = event.getTargetRanges?.()[0]
        const selection = currentInputSelection(view)

        const { from, to } = target
          ? {
              from: view.posAtDOM(target.startContainer, target.startOffset),
              to: view.posAtDOM(target.endContainer, target.endOffset)
            }
          : selection

        const state = syncInputSelection(view, selection)
        const transaction = state.tr.insertText(event.data, from, to)

        transaction.setSelection(
          TextSelection.create(transaction.doc, from + event.data.length)
        )

        view.dispatch(transaction.scrollIntoView())
        event.preventDefault()

        return true
      }

      if (
        event.inputType !== 'deleteContentBackward' &&
        event.inputType !== 'deleteContentForward'
      )
        return false

      const result = deleteAtInputSelection(
        view,
        preview,
        event.inputType === 'deleteContentBackward' ? 'backward' : 'forward'
      )

      if (!result) return false

      return applyMarkdownEdit(view, event, result)
    }
  }
}

const applyMarkdownEdit = (
  view: EditorView,
  event: Event,
  result: NonNullable<ReturnType<typeof deleteMarkdownSource>>
) => {
  if (result.revealed)
    result.transaction.setMeta(markdownPreviewKey, {
      revealed: result.revealed
    })

  view.dispatch(result.transaction)
  event.preventDefault()

  return true
}
