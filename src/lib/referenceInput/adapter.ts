import type { Ref } from 'vue'

import type { Editor } from '@tiptap/core'
import type { SourceAnalysis } from '@traq-flavored-markdown/sdk/editor'
import type { MarkdownServices } from '@traq-flavored-markdown/vue-editor'

import type { InputMode, InputPart, Reference } from '../references'
import type {
  Candidate,
  SuggestionShortcut,
  SuggestionWord
} from '../suggestion/types'

export interface ReferenceSuggestionOptions {
  editor: () => Editor | undefined
  mode: () => InputMode
  isComposing: () => boolean
  finishComposition: (action: () => void) => void
  insertParts: (parts: InputPart[], range: { from: number; to: number }) => void
  analyze: MarkdownServices['analyze']
}

export interface ReferenceSuggestions {
  shown: Readonly<Ref<boolean>>
  candidates: Readonly<Ref<Candidate[]>>
  selectedIndex: Readonly<Ref<number>>
  shortcuts: Readonly<Ref<SuggestionShortcut[]>>
  position: Readonly<Ref<{ top: number; left: number }>>
  update(): void
  updatePosition(keepHorizontal?: boolean): void
  hide(): void
  confirmCandidate(word: SuggestionWord): void
  continuePath(word: SuggestionWord, appendSlash?: boolean): void
  appendEffect(word: SuggestionWord): void
  onKeyDown(event: KeyboardEvent): boolean
}

export interface ReferenceCodec {
  parse(source: string, mode: InputMode): InputPart[]
  serialize(parts: readonly InputPart[]): string
  /** Preserve part order/count; a reference may become literal text. */
  normalize(parts: readonly InputPart[], analysis?: SourceAnalysis): InputPart[]
}

/** Host integration, fixed for the lifetime of one mounted input. */
export interface ReferenceInputAdapter {
  markdown: MarkdownServices
  references: ReferenceCodec
  label(reference: Reference): string
  suggestions(options: ReferenceSuggestionOptions): ReferenceSuggestions
  clipboard: {
    read(
      data: Pick<DataTransfer, 'getData'>,
      mode: InputMode
    ): InputPart[] | undefined
    write(
      data: Pick<DataTransfer, 'setData'>,
      parts: readonly InputPart[],
      mode: InputMode
    ): void
    fromText?(
      text: string,
      before: string,
      after: string
    ): InputPart[] | undefined
  }
}
