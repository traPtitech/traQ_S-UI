import { type EditorState, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import { toDocumentPosition } from './editorCoordinates'
import { type MarkdownFormat, isMarkdownSourceOnly } from './markdown'
import { markdownSourceActive, markdownSourceVisible } from './markdownEditing'
import { type PreviewState, markdownPreviewKey } from './markdownPreviewState'
import { renderMarkdownWidget } from './markdownWidget'

export const buildMarkdownDecorations = (
  state: EditorState,
  preview: PreviewState,
  previous?: PreviewState
): Pick<PreviewState, 'decorations' | 'decorationCache' | 'anchor'> => {
  if (!preview.enabled)
    return {
      decorations: DecorationSet.empty,
      decorationCache: new Map(),
      anchor: undefined
    }

  const reusable =
    previous?.enabled &&
    previous.formats === preview.formats &&
    previous.referenceLabelKey === preview.referenceLabelKey

  let result = reusable ? previous.decorations : DecorationSet.empty
  const added: Decoration[] = []
  const removed: Decoration[] = []
  const decorationCache: PreviewState['decorationCache'] = new Map()
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
      format.style === 'spoiler' &&
      markdownSourceActive(preview, state.selection, format)

    const sourceVisible = markdownSourceVisible(
      preview,
      state.selection,
      format
    )

    const cached = reusable ? previous.decorationCache.get(format) : undefined

    if (
      cached &&
      cached.visible === sourceVisible &&
      cached.active === active
    ) {
      decorationCache.set(format, cached)
      continue
    }

    if (cached) removed.push(...cached.decorations)
    const decorations: Decoration[] = []
    decorationCache.set(format, { visible: sourceVisible, active, decorations })
    const className = `markdown-input-${format.classSuffix}`

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
        (format.kind === 'container' && format.container.quoteDepth > 0) ||
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
            key: `${className}:${format.from}:${JSON.stringify([format.replacement.type, format.replacement.text, format.replacement.environmentRevision])}:${preview.referenceLabelKey}`,
            // 原文を開く際にも、先頭のカーソル用要素を同じ DOM に残す。
            side: 2
          }
        )
      )
    }

    added.push(...decorations)
  }

  result = result.remove(removed)

  return { decorations: result.add(state.doc, added), decorationCache, anchor }
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

export const mergeSyntaxRanges = (ranges: MarkdownFormat['content'][]) => {
  const merged: { from: number; to: number }[] = []

  for (const range of ranges.sort((a, b) => a.from - b.from)) {
    const previous = merged.at(-1)

    if (previous && range.from <= previous.to)
      previous.to = Math.max(previous.to, range.to)
    else merged.push({ ...range })
  }

  return merged
}
