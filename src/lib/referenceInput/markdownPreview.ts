import { Plugin, TextSelection } from '@tiptap/pm/state'
import { DecorationSet, type EditorView } from '@tiptap/pm/view'

import { isComposingInput } from './composition'
import { analyzeEditorDocument } from './documentAnalysis'
import { toDocumentPosition } from './editorSource'
import { inputLifecycleKey } from './inputLifecycle'
import { markdownFormats } from './markdown'
import {
  buildMarkdownDecorations,
  mergeSyntaxRanges
} from './markdownDecorations'
import {
  deleteMarkdownSource,
  enterMarkdownSource,
  markdownSourceRangesAt,
  restoreMarkdownSourceCaret,
  retainMarkdownSource
} from './markdownEditing'
import { type PreviewState, markdownPreviewKey } from './markdownPreviewState'
import { currentInputSelection } from './selection'

export { markdownPreviewKey } from './markdownPreviewState'

export const markdownPreview = () =>
  new Plugin<PreviewState>({
    key: markdownPreviewKey,

    state: {
      init: () => ({
        enabled: false,
        focused: false,
        composing: false,
        labels: '',
        compositionDecorations: undefined,
        decorations: DecorationSet.empty,
        rendered: new Map(),
        syntax: [],
        formats: [],
        revealed: []
      }),

      apply: (transaction, previous, oldState, newState) => {
        const options = transaction.getMeta(markdownPreviewKey) as
          Partial<Pick<PreviewState, 'labels' | 'revealed'>> | undefined

        const lifecycle = inputLifecycleKey.getState(newState)
        const next = {
          ...previous,
          ...options,
          enabled: lifecycle?.markdown ?? false,
          focused: lifecycle?.focused ?? false,
          composing: lifecycle?.composing ?? false
        }

        if (
          next.enabled &&
          !next.composing &&
          (transaction.docChanged || !previous.enabled || previous.composing)
        ) {
          next.formats = markdownFormats(analyzeEditorDocument(transaction.doc))

          next.syntax = mergeSyntaxRanges(
            next.formats.flatMap(format => format.syntax)
          )
        }

        next.revealed =
          options?.revealed ??
          retainMarkdownSource(
            next.composing ? { ...previous, formats: [] } : previous,
            oldState,
            transaction
          )

        if (
          !next.enabled ||
          transaction.getMeta(inputLifecycleKey)?.focused === false
        )
          next.revealed = []

        const startingComposition = next.composing && !previous.composing

        if (next.enabled && startingComposition && oldState.selection.empty) {
          next.revealed = next.revealed.concat(
            markdownSourceRangesAt(previous.formats, oldState.selection.head)
          )
        }

        // 変換対象の DOM を作り直さず、開始時の装飾を文字の増減に追従させる。
        next.compositionDecorations =
          next.enabled && next.composing
            ? (
                previous.compositionDecorations ??
                buildMarkdownDecorations(oldState, {
                  ...previous,
                  revealed: next.revealed
                }).decorations
              ).map(transaction.mapping, transaction.doc)
            : undefined

        if (!next.composing)
          Object.assign(
            next,
            buildMarkdownDecorations(newState, next, previous)
          )

        return next
      }
    },

    view: () => ({
      update: (view, previousState) => {
        const preview = markdownPreviewKey.getState(view.state)

        const startingComposition =
          preview?.composing &&
          !markdownPreviewKey.getState(previousState)?.composing

        if (
          preview?.enabled &&
          !view.composing &&
          (!preview.composing || startingComposition)
        )
          restoreMarkdownSourceCaret(view)
      }
    }),

    props: {
      handleClick: (view, position, event) => {
        const preview = markdownPreviewKey.getState(view.state)
        if (
          !preview?.enabled ||
          !view.editable ||
          preview.composing ||
          view.composing ||
          event.button !== 0 ||
          event.shiftKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        )
          return false

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
          view.state.tr.setSelection(
            TextSelection.create(view.state.doc, caret)
          )
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
              ? deleteMarkdownSource(
                  view,
                  preview,
                  event.key === 'Backspace' ? 'backward' : 'forward'
                )
              : undefined

        if (!result) return false

        return applyMarkdownEdit(view, event, result)
      },

      handleDOMEvents: {
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
                  from: view.posAtDOM(
                    target.startContainer,
                    target.startOffset
                  ),
                  to: view.posAtDOM(target.endContainer, target.endOffset)
                }
              : selection

            // Undo は編集前の state.selection を保存するため、選択変更を先に確定する。
            if (!selection.eq(view.state.selection))
              view.dispatch(view.state.tr.setSelection(selection))

            const transaction = view.state.tr.insertText(event.data, from, to)

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

          const result = deleteMarkdownSource(
            view,
            preview,
            event.inputType === 'deleteContentBackward' ? 'backward' : 'forward'
          )

          if (!result) return false

          if (result.revealed)
            result.transaction.setMeta(markdownPreviewKey, {
              revealed: result.revealed
            })

          view.dispatch(result.transaction)
          event.preventDefault()

          return true
        }
      },

      decorations: state => {
        const preview = markdownPreviewKey.getState(state)

        if (!preview?.enabled) return DecorationSet.empty

        return preview.compositionDecorations ?? preview.decorations
      }
    }
  })

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
