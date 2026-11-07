interface SuggestionWordBase {
  delimiter?: string
  text: string
}

type EntityWordKind = 'user' | 'user-group' | 'stamp' | 'channel'

export type WordWithId = {
  [Kind in EntityWordKind]: SuggestionWordBase & { type: Kind; id: string }
}[EntityWordKind]

export interface WordWithoutId extends SuggestionWordBase {
  type: 'stamp-effect'
}

export type SuggestionWord = WordWithId | WordWithoutId

export type ChannelWord = Extract<SuggestionWord, { type: 'channel' }>

export type Candidate = { display?: string; preview?: string } & (
  | {
      word: Extract<SuggestionWord, { type: 'channel' }>
      canContinuePath?: boolean
      canAppendEffect?: never
    }
  | {
      word: Exclude<SuggestionWord, { type: 'channel' }>
      canContinuePath?: never
      canAppendEffect?: boolean
    }
)

export type SuggestionShortcut = {
  keys: string[]
  description: string
}
