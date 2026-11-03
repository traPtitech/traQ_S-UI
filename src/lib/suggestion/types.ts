interface WordBase {
  delimiter?: string
  text: string
}

export interface WordWithId extends WordBase {
  type: 'user' | 'user-group' | 'stamp' | 'channel'
  id: string
}

export interface WordWithoutId extends WordBase {
  type: 'stamp-effect'
}

export type Word = WordWithId | WordWithoutId

export interface Candidate {
  word: Word
  display?: string
  canContinuePath?: boolean
}

export type SuggestionShortcut = {
  keys: string[]
  description: string
}
