import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

import { contentToParts } from './editorDocument'
import { normalizeMessageParts } from './message'

export const messageExtension = Extension.create({
  name: 'messageReferences',
  addProseMirrorPlugins: () => [
    new Plugin({
      appendTransaction: (transactions, _oldState, state) => {
        if (!transactions.some(tr => tr.docChanged)) return null

        const parts = contentToParts(state.doc)
        const normalized = normalizeMessageParts(parts)
        const tr = state.tr
        let index = 0

        state.doc.descendants((node, pos) => {
          if (!node.isInline) return

          const next = normalized[index++]

          if (node.type.name === 'reference' && next?.type === 'text')
            tr.replaceWith(
              tr.mapping.map(pos),
              tr.mapping.map(pos + node.nodeSize),
              state.schema.text(next.text)
            )
        })

        return tr.docChanged ? tr : null
      }
    })
  ]
})
