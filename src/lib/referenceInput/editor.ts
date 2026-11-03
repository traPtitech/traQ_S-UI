import { Node, extensions } from '@tiptap/core'

import type { InputMode, Reference } from '../references'
import { compositionSafeShortcuts } from './composition'
import { inputHistoryExtension } from './inputHistory'
import { inputLifecycleExtension } from './inputLifecycle'
import { markdownExtension } from './markdownExtension'
import { messageExtension } from './messageExtension'
import { referenceNode } from './referenceNode'

export { partsToContent, contentToParts } from './editorDocument'

export interface ReferenceInputHandle {
  element?: HTMLElement
  focus: (position?: 'end') => void
  insertText: (text: string, options?: { focus?: boolean }) => void
  insertLineBreak: () => void
}

/** 組み込みの core keymap は無効化して使用する。 */
export const inputExtensions = ({
  label,
  mode,
  isComposing
}: {
  label: (reference: Reference) => string
  mode: InputMode
  isComposing?: () => boolean
}) => [
  extensions.Keymap.extend({
    addKeyboardShortcuts() {
      return compositionSafeShortcuts(this.parent?.() ?? {}, isComposing)
    }
  }),
  Node.create({ name: 'doc', topNode: true, content: 'paragraph' }),

  Node.create({
    name: 'paragraph',
    content: 'inline*',
    group: 'block',
    code: true,
    whitespace: 'pre',
    parseHTML: () => [{ tag: 'p' }],
    renderHTML: () => ['p', 0]
  }),

  Node.create({ name: 'text', group: 'inline' }),

  referenceNode(label, isComposing),
  inputHistoryExtension(isComposing),
  inputLifecycleExtension,
  ...(mode === 'message' ? [markdownExtension, messageExtension] : [])
]
