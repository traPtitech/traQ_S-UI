interface WordBase {
  delimiter?: string
  text: string
}

type EntityWordKind = 'user' | 'user-group' | 'stamp' | 'channel'

export type WordWithId = {
  [Kind in EntityWordKind]: WordBase & { type: Kind; id: string }
}[EntityWordKind]

export interface WordWithoutId extends WordBase {
  type: 'stamp-effect'
}

export type Word = WordWithId | WordWithoutId

export type Candidate = { display?: string } & (
  | { word: Extract<Word, { type: 'channel' }>; canContinuePath?: boolean }
  | { word: Exclude<Word, { type: 'channel' }>; canContinuePath?: never }
)

export type SuggestionShortcut = {
  keys: string[]
  description: string
}
