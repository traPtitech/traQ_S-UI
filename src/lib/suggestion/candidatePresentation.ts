import type { Word } from './types'

export const candidateKey = (word: Word) =>
  `${word.type}:${word.type === 'stamp-effect' ? word.text : word.id}`
export const candidateRowId = (popupId: string, word: Word) =>
  `${popupId}-${encodeURIComponent(candidateKey(word))}`

const labels: Record<Word['type'], string> = {
  user: 'ユーザー',
  'user-group': 'グループ',
  channel: 'チャンネル',
  stamp: 'スタンプ',
  'stamp-effect': 'スタンプ効果'
}

export const candidateLabel = (word: Word, display = word.text) =>
  `${display}（${labels[word.type]}）`

export const candidateTypeLabel = (word: Word) => labels[word.type]
