import { Extension } from '@tiptap/core'

import { markdownPreview } from './markdownPreview'

export const markdownExtension = Extension.create({
  name: 'markdownInput',
  addProseMirrorPlugins: () => [markdownPreview()]
})
