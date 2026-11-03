import {
  type EditorState,
  Plugin,
  PluginKey,
  TextSelection
} from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import { isComposingInput } from './composition'
import { editorSource, toDocumentPosition } from './editorSource'
import { inputLifecycleKey } from './inputLifecycle'
import {
  type MarkdownFormat,
  isMarkdownSourceOnly,
  markdownFormats
} from './markdown'
import {
  type MarkdownEditingState,
  deleteMarkdownSource,
  enterMarkdownSource,
  markdownSourceActive,
  markdownSourceRangesAt,
  markdownSourceVisible,
  restoreMarkdownSourceCaret,
  retainMarkdownSource
} from './markdownEditing'
import { renderMarkdownWidget } from './markdownWidget'
import { currentInputSelection } from './selection'

type PreviewState = MarkdownEditingState & {
  labels: string
  compositionDecorations: DecorationSet | undefined
  decorations: DecorationSet
  rendered: Map<
    MarkdownFormat,
    { visible: boolean; active: boolean; decorations: Decoration[] }
  >
  anchor?: { position: number; side: number; decoration: Decoration }
  syntax: MarkdownFormat['content'][]
}

export const markdownPreviewKey = new PluginKey<PreviewState>('markdownPreview')

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
          next.formats = markdownFormats(editorSource(transaction.doc))

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

        if (result.revealed)
          result.transaction.setMeta(markdownPreviewKey, {
            revealed: result.revealed
          })

        view.dispatch(result.transaction)
        event.preventDefault()

        return true
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

const buildMarkdownDecorations = (
  state: EditorState,
  preview: PreviewState,
  previous?: PreviewState
): Pick<PreviewState, 'decorations' | 'rendered' | 'anchor'> => {
  if (!preview.enabled)
    return {
      decorations: DecorationSet.empty,
      rendered: new Map(),
      anchor: undefined
    }

  const reusable =
    previous?.enabled &&
    previous.formats === preview.formats &&
    previous.labels === preview.labels

  let result = reusable ? previous.decorations : DecorationSet.empty
  const added: Decoration[] = []
  const removed: Decoration[] = []
  const rendered: PreviewState['rendered'] = new Map()
  const syntax = preview.syntax
  const previousAnchor = reusable ? previous.anchor : undefined
  let anchor: PreviewState['anchor']

  const replacements = preview.formats.filter(
    format => format.kind === 'rendered-inline'
  )

  const caretAtBoundary =
    preview.focused &&
    state.selection.empty &&
    replacements.some(
      format =>
        state.selection.head === toDocumentPosition(format.from) ||
        state.selection.head === toDocumentPosition(format.to)
    )

  if (caretAtBoundary) {
    const side = replacements.some(
      format => state.selection.head === toDocumentPosition(format.from)
    )
      ? 1
      : -1

    if (
      previousAnchor?.position === state.selection.head &&
      previousAnchor.side === side
    ) {
      anchor = previousAnchor
    } else {
      const decoration = Decoration.widget(
        state.selection.head,
        () => {
          const span = document.createElement('span')
          span.className = 'markdown-input-caret-anchor'
          span.setAttribute('aria-hidden', 'true')
          span.textContent = '\u200B'
          return span
        },
        { key: `markdown-input-caret-anchor:${side}`, side }
      )

      anchor = { position: state.selection.head, side, decoration }
      added.push(decoration)
    }
  }

  if (previousAnchor && anchor !== previousAnchor)
    removed.push(previousAnchor.decoration)

  for (const format of preview.formats) {
    const active =
      format.className === 'spoiler' &&
      markdownSourceActive(preview, state.selection, format)

    const sourceVisible = markdownSourceVisible(
      preview,
      state.selection,
      format
    )

    const cached = reusable ? previous.rendered.get(format) : undefined

    if (
      cached &&
      cached.visible === sourceVisible &&
      cached.active === active
    ) {
      rendered.set(format, cached)
      continue
    }

    if (cached) removed.push(...cached.decorations)
    const decorations: Decoration[] = []
    rendered.set(format, { visible: sourceVisible, active, decorations })
    const className = `markdown-input-${format.className}`

    if (
      format.container &&
      (format.container.quoteDepth || format.container.indent)
    ) {
      const { quoteDepth, indent } = format.container

      decorations.push(
        Decoration.widget(
          toDocumentPosition(format.from),
          () => {
            const guide = document.createElement('span')
            guide.className = 'markdown-input-container-guide'
            guide.setAttribute('aria-hidden', 'true')
            guide.style.paddingInlineEnd = `${indent}ch`

            for (let depth = 0; depth < quoteDepth; depth++) {
              const bar = document.createElement('span')
              bar.className = 'markdown-input-quote-bar'
              guide.append(bar)
            }

            return guide
          },
          {
            key: `markdown-input-container:${format.from}:${quoteDepth}:${indent}`,
            side: -1
          }
        )
      )
    }

    if (isMarkdownSourceOnly(format)) {
      decorations.push(
        Decoration.inline(
          toDocumentPosition(format.from),
          toDocumentPosition(format.to),
          {
            class: 'markdown-input-source'
          }
        )
      )

      added.push(...decorations)
      continue
    }

    if (
      format.content.from < format.content.to &&
      format.kind !== 'rendered-inline'
    ) {
      // 引用の色や水平線は全体に適用し、文字の装飾だけをガイドの範囲から外す。
      const ranges =
        format.className === 'quote' ||
        format.kind === 'list-marker' ||
        format.kind === 'rule'
          ? [format.content]
          : markdownContentRanges(format.content, syntax)

      for (const range of ranges) {
        decorations.push(
          Decoration.inline(
            toDocumentPosition(range.from),
            toDocumentPosition(range.to),
            {
              class: className + (active ? ' markdown-input-active' : '')
            }
          )
        )
      }
    }

    for (const syntax of format.syntax) {
      if (sourceVisible && format.kind === 'rendered-inline') continue

      if (syntax.from < syntax.to)
        decorations.push(
          Decoration.inline(
            toDocumentPosition(syntax.from),
            toDocumentPosition(syntax.to),
            {
              class: sourceVisible
                ? 'markdown-input-syntax'
                : 'markdown-input-hidden',
              ...(!sourceVisible ? { 'aria-hidden': 'true' } : {})
            }
          )
        )
    }

    if (!sourceVisible && format.kind === 'rendered-inline') {
      decorations.push(
        Decoration.widget(
          toDocumentPosition(format.content.from),
          view => {
            const span = renderMarkdownWidget(format)

            span.addEventListener('mousedown', event => event.preventDefault())

            span.addEventListener('click', event => {
              event.preventDefault()

              const { left, width } = span.getBoundingClientRect()
              const rtl = getComputedStyle(span).direction === 'rtl'
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
            })

            return span
          },
          {
            key: `${className}:${format.from}:${JSON.stringify(format.replacement)}:${preview.labels}`,
            // 原文を開く際にも、先頭のカーソル用要素を同じ DOM に残す。
            side: 2
          }
        )
      )
    }

    added.push(...decorations)
  }

  result = result.remove(removed)

  return { decorations: result.add(state.doc, added), rendered, anchor }
}

const markdownContentRanges = (
  content: MarkdownFormat['content'],
  syntax: readonly MarkdownFormat['content'][]
) => {
  const ranges: MarkdownFormat['content'][] = []
  let from = content.from

  let first = 0
  let last = syntax.length

  while (first < last) {
    const middle = (first + last) >>> 1

    if ((syntax[middle]?.to ?? Infinity) <= from) first = middle + 1
    else last = middle
  }

  for (let index = first; index < syntax.length; index++) {
    const guide = syntax[index]
    if (!guide) continue
    if (guide.to <= from) continue
    if (guide.from >= content.to) break

    if (from < guide.from) ranges.push({ from, to: guide.from })

    from = Math.max(from, guide.to)

    if (from >= content.to) break
  }

  if (from < content.to) ranges.push({ from, to: content.to })

  return ranges
}

const mergeSyntaxRanges = (ranges: MarkdownFormat['content'][]) => {
  const merged: { from: number; to: number }[] = []

  for (const range of ranges.sort((a, b) => a.from - b.from)) {
    const previous = merged.at(-1)

    if (previous && range.from <= previous.to)
      previous.to = Math.max(previous.to, range.to)
    else merged.push({ ...range })
  }

  return merged
}
