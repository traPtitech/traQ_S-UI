import type { Node } from '@tiptap/pm/model'

import { referencePlaceholder } from '../references/projection'

/** 単一 paragraph 内で、参照 atom を ProseMirror と同じ 1 文字として扱う。 */
export const editorTextBetween = (
  doc: Node,
  from = 1,
  to = doc.content.size - 1
) => doc.textBetween(from, to, '', referencePlaceholder)
