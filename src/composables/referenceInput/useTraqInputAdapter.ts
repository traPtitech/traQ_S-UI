import { shallowRef } from 'vue'

import type { ReferenceInputAdapter as EditorAdapter } from '@traq-flavored-markdown/vue-editor'

import type {
  ReferenceInputAdapter,
  ReferenceSuggestions
} from '/@/lib/referenceInput/adapter'
import type { InputMode, Reference } from '/@/lib/references'
import {
  candidateLabel,
  candidateRowId
} from '/@/lib/suggestion/candidatePresentation'

/** Adapt the traQ completion state machine to the reusable input's lifecycle. */
export const useTraqInputAdapter = (
  host: ReferenceInputAdapter,
  mode: InputMode
) => {
  const suggestions = shallowRef<ReferenceSuggestions>()
  const adapter: EditorAdapter<Reference> = {
    markdown: host.markdown,
    label: host.label,
    references: {
      parse: source => host.references.parse(source, mode),
      serialize: host.references.serialize,
      ...(mode === 'message' ? { normalize: host.references.normalize } : {})
    },
    clipboard: {
      read: data => host.clipboard.read(data, mode),
      write: (data, parts) => host.clipboard.write(data, parts, mode),
      ...(mode === 'message' ? { fromText: host.clipboard.fromText } : {})
    },
    suggestions: context => {
      const current = host.suggestions({
        editor: context.editor,
        mode: () => mode,
        analyze: host.markdown.analyze,
        isComposing: context.isComposing,
        finishComposition: context.finishComposition,
        insertParts: (parts, range) =>
          context.insertParts(parts, { from: range.from - 1, to: range.to - 1 })
      })
      suggestions.value = current
      return {
        update: current.update,
        updatePosition: current.updatePosition,
        hide: current.hide,
        onKeyDown: current.onKeyDown,
        accessibility: () => {
          const candidate =
            current.candidates.value[current.selectedIndex.value]
          const expanded =
            current.shown.value && current.candidates.value.length > 0
          return {
            popupRole: 'grid',
            expanded,
            ...(expanded && candidate
              ? {
                  activeId: candidateRowId(context.popupId, candidate.word),
                  announcement: `${candidateLabel(candidate.word, candidate.display)}、${current.selectedIndex.value + 1} / ${current.candidates.value.length}`
                }
              : {})
          }
        }
      }
    }
  }
  return { adapter, suggestions }
}
