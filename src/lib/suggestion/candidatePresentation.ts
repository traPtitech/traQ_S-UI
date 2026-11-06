import type { SuggestionWord } from './types'

export const candidateKey = (word: SuggestionWord) =>
  `${word.type}:${word.type === 'stamp-effect' ? word.text : word.id}`
export const candidateRowId = (popupId: string, word: SuggestionWord) =>
  `${popupId}-${encodeURIComponent(candidateKey(word))}`

const labels: Record<SuggestionWord['type'], string> = {
  user: 'ユーザー',
  'user-group': 'グループ',
  channel: 'チャンネル',
  stamp: 'スタンプ',
  'stamp-effect': 'スタンプ効果'
}

export const candidateLabel = (word: SuggestionWord, display = word.text) =>
  `${display}（${labels[word.type]}）`

export const candidateTypeLabel = (word: SuggestionWord) => labels[word.type]
