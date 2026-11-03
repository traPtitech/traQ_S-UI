import { Extension } from '@tiptap/core'

import { markdownListInput } from './markdownListInput'
import { markdownPreview } from './markdownPreview'

export const markdownExtension = Extension.create({
  name: 'markdownInput',
  addProseMirrorPlugins: () => [markdownListInput(), markdownPreview()]
})
