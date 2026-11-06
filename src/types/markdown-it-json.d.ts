declare module 'markdown-it-json' {
  import type MarkdownIt from 'markdown-it'
  import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'
  import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs'

  export default function json<T extends Record<string, unknown>>(
    validate: (value: Readonly<Record<string, unknown>>) => value is T,
    transform: (state: StateBlock | StateInline, value: T) => void
  ): (parser: MarkdownIt) => void
}
