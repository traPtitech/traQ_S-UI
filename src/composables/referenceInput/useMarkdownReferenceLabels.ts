import { type ShallowRef, watchEffect } from 'vue'

import type { Editor } from '@tiptap/vue-3'

import { contentToParts } from '/@/lib/referenceInput/editorDocument'
import { markdownPreviewKey } from '/@/lib/referenceInput/markdownPreviewState'
import type { Reference } from '/@/lib/references'

export default function useMarkdownReferenceLabels(
  editor: ShallowRef<Editor | undefined>,
  label: (reference: Reference) => string
) {
  watchEffect(() => {
    const current = editor.value
    if (!current || current.isDestroyed) return

    const preview = markdownPreviewKey.getState(current.state)
    if (!preview) return

    const labels = contentToParts(current.state.doc)
      .filter(part => part.type === 'reference')
      .map(part => label(part.reference))

    const serialized = JSON.stringify(labels)
    if (preview.labels === serialized) return

    current.view.dispatch(
      current.state.tr.setMeta(markdownPreviewKey, {
        labels: serialized
      })
    )
  })
}
