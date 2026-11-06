import { PluginKey } from '@tiptap/pm/state'
import type { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { MarkdownFormat } from './markdown'
import type { MarkdownEditingState } from './markdownEditing'

export type PreviewState = MarkdownEditingState & {
  compositionDecorations: DecorationSet | undefined
  decorations: DecorationSet
  decorationCache: Map<
    MarkdownFormat,
    { visible: boolean; active: boolean; decorations: Decoration[] }
  >
  anchor?: { position: number; side: number; decoration: Decoration }
  syntax: MarkdownFormat['content'][]
}

export const markdownPreviewKey = new PluginKey<PreviewState>('markdownPreview')
