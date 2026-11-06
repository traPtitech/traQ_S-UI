import type { Word } from '/@/lib/suggestion/types'

import { analyzeMarkdownSource } from '../markdown/analysis'
import {
  animeEffectSet,
  maxAnimeEffectCount,
  sizeEffectSet
} from '../markdown/effects'
import {
  type InputMode,
  type InputPart,
  type SearchOperator,
  type SelectedReference,
  searchReferenceTypes
} from '../references'

export type SuggestionTarget = {
  from: number
  to: number
  word: string
} & (
  | {
      mode: 'message'
      intent: 'mention' | 'user-icon' | 'channel' | 'stamp'
    }
  | {
      mode: 'message'
      intent: 'stamp-effect'
      stampPrefix: string
    }
  | { mode: 'search'; operator: SearchOperator }
)

export const isStampSuggestion = (target: SuggestionTarget) =>
  target.mode === 'message' &&
  ['user-icon', 'stamp', 'stamp-effect'].includes(target.intent)

export const findSuggestionTarget = (
  before: string,
  cursor: number,
  mode: InputMode,
  analyze = analyzeMarkdownSource
): SuggestionTarget | undefined => {
  const text = /[^\s\uFFFC]*$/.exec(before)?.[0] ?? ''

  if (mode === 'search') {
    const match = /^(from|by|to|in):(.*)$/.exec(text)
    if (!match) return

    const operator = match[1] === 'by' ? 'from' : match[1]
    if (operator !== 'from' && operator !== 'to' && operator !== 'in') return

    const body = match[2] ?? ''

    const word = /^[@＠#＃]/.test(body)
      ? body
      : `${operator === 'in' ? '#' : '@'}${body}`

    return { mode, operator, word, from: cursor - text.length, to: cursor }
  }

  const word = /[@＠#＃:.][^@＠#＃:.]*$/.exec(text)?.[0]
  if (!word) return

  const start = before.length - word.length
  const closesStamp = (position: number) =>
    analyze(before).nodes.some(
      node => node.kind === 'stamp' && node.to === position + 1
    )

  // スタンプの終端を、次のスタンプやユーザーアイコンの開始に使わない。
  if (word.startsWith(':') && closesStamp(start)) return

  if (word.startsWith('.')) {
    // 閉じればスタンプになる範囲でだけ、エフェクト候補を表示する。
    const closed = before.slice(0, start) + ':'
    const stamp = analyze(closed).nodes.find(
      node => node.kind === 'stamp' && node.to === closed.length
    )
    if (!stamp) return

    return {
      mode,
      intent: 'stamp-effect',
      word,
      from: cursor - word.length,
      to: cursor,
      stampPrefix: before.slice(stamp.from, start)
    }
  }

  const icon =
    /^[@＠]/.test(word) && before[start - 1] === ':' && !closesStamp(start - 1)

  const intent = icon
    ? 'user-icon'
    : /^[@＠]/.test(word)
      ? 'mention'
      : /^[#＃]/.test(word)
        ? 'channel'
        : 'stamp'

  return { mode, intent, word, from: cursor - word.length, to: cursor }
}

export const acceptsCandidate = (
  target: SuggestionTarget,
  word: Word,
  dmChannelId: (userId: string) => string | undefined
) => {
  if (target.mode === 'message') {
    switch (target.intent) {
      case 'user-icon':
        return word.type === 'user'
      case 'mention':
        return word.type === 'user' || word.type === 'user-group'
      case 'channel':
        return word.type === 'channel'
      case 'stamp':
        return word.type === 'stamp'
      case 'stamp-effect':
        return (
          word.type === 'stamp-effect' &&
          acceptsStampEffect(target.stampPrefix, word.text)
        )
    }
  }

  if (target.operator === 'in')
    return (
      word.type === 'channel' ||
      (word.type === 'user' && !!dmChannelId(word.id))
    )

  return word.type === 'user' || word.type === 'user-group'
}

const acceptsStampEffect = (stampPrefix: string, effect: string) => {
  // hsl() など色スタンプ内の小数点はエフェクトの区切りに数えない。
  const effects = (stampPrefix + effect)
    .slice(stampPrefix.lastIndexOf(')') + 1)
    .split('.')
    .slice(1)
  const animations: ReadonlySet<string> = animeEffectSet
  const sizes: ReadonlySet<string> = sizeEffectSet

  return (
    effects.every(name => animations.has(name) || sizes.has(name)) &&
    effects.filter(name => animations.has(name)).length <= maxAnimeEffectCount
  )
}

export const previewCandidateText = (
  target: SuggestionTarget,
  word: Word,
  dmChannelId: (userId: string) => string | undefined
): string | undefined => {
  if (!acceptsCandidate(target, word, dmChannelId)) return

  return target.mode === 'search'
    ? target.operator + ':' + word.text
    : word.text
}

export const confirmCandidateParts = (
  target: SuggestionTarget,
  word: Word,
  dmChannelId: (userId: string) => string | undefined
): InputPart[] | undefined => {
  if (!acceptsCandidate(target, word, dmChannelId)) return

  if (
    word.type === 'stamp' ||
    word.type === 'stamp-effect' ||
    (target.mode === 'message' && target.intent === 'user-icon')
  )
    return [{ type: 'text', text: word.text + ': ' }]

  const entityKind = word.type === 'user-group' ? 'group' : word.type
  let reference: SelectedReference

  if (target.mode === 'message') {
    reference = { type: entityKind, id: word.id, raw: word.text }
  } else if (target.operator === 'in') {
    const id = word.type === 'user' ? dmChannelId(word.id) : word.id
    if (!id || (word.type !== 'user' && word.type !== 'channel')) return

    reference = {
      type: 'search-in',
      id,
      raw: 'in:' + word.text,
      kind: word.type === 'user' ? 'dm' : 'channel'
    }
  } else {
    if (entityKind !== 'user' && entityKind !== 'group') return

    reference = {
      type: searchReferenceTypes[target.operator],
      id: word.id,
      raw: target.operator + ':' + word.text,
      kind: entityKind
    }
  }

  return [
    { type: 'reference', reference },
    { type: 'text', text: ' ' }
  ]
}

export const completedChannelPath = (target: SuggestionTarget, path: string) =>
  `${target.mode === 'search' ? `${target.operator}:` : ''}${path}`
