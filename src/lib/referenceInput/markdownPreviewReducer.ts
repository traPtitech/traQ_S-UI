import type { StateField } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'

import { analyzeEditorDocument } from './documentAnalysis'
import { inputLifecycleKey } from './inputLifecycle'
import { markdownFormats } from './markdown'
import {
  buildMarkdownDecorations,
  mergeSyntaxRanges
} from './markdownDecorations'
import { markdownSourceRangesAt, retainMarkdownSource } from './markdownEditing'
import { type PreviewState, markdownPreviewKey } from './markdownPreviewState'

export const markdownPreviewState: StateField<PreviewState> = {
  init: () => ({
    enabled: false,
    focused: false,
    composing: false,
    compositionDecorations: undefined,
    decorations: DecorationSet.empty,
    decorationCache: new Map(),
    syntax: [],
    formats: [],
    revealed: []
  }),

  apply: (transaction, previous, oldState, newState) => {
    const options = transaction.getMeta(markdownPreviewKey) as
      Partial<Pick<PreviewState, 'revealed'>> | undefined

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
      Object.assign(next, buildMarkdownDecorations(newState, next, previous))

    return next
  }
}
