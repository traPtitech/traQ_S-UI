import type { Node } from '@tiptap/pm/model'

import type { Candidate, SuggestionShortcut } from '../suggestion/types'
import type { SuggestionTarget } from './suggestion'

export type CandidateSelection =
  { type: 'parent' } | { type: 'candidate'; index: number }

export type SuggestionState =
  | { status: 'closed' }
  | {
      status: 'suggesting'
      target: SuggestionTarget
      selection: CandidateSelection
    }
  | {
      status: 'cycling'
      target: SuggestionTarget
      selection: CandidateSelection
      candidates: Candidate[]
      doc: Node
    }

type KeyContext = {
  cycling: boolean
  count: number
  canDescend: boolean
  hasChildTarget: boolean
  canAppendEffect: boolean
}

type SuggestionAction =
  | 'preview'
  | 'next'
  | 'previous'
  | 'confirm'
  | 'descend'
  | 'append-path'
  | 'append-effect'
  | 'dismiss'

const tabAction = (context: KeyContext): SuggestionAction =>
  !context.cycling
    ? 'preview'
    : context.count > 1
      ? 'next'
      : context.canDescend
        ? 'descend'
        : 'confirm'

export const suggestionKeyAction = (
  event: Pick<
    KeyboardEvent,
    'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'
  >,
  context: KeyContext
): SuggestionAction | undefined => {
  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    (event.shiftKey && event.key !== 'Tab')
  )
    return

  switch (event.key) {
    case 'Tab':
      return event.shiftKey ? 'previous' : tabAction(context)
    case 'ArrowUp':
      return 'previous'
    case 'ArrowDown':
      return 'next'
    case 'ArrowRight':
      return context.hasChildTarget ? 'descend' : undefined
    case '/':
      return context.canDescend ? 'append-path' : undefined
    case '.':
      return context.canAppendEffect ? 'append-effect' : undefined
    case 'Enter':
      return 'confirm'
    case 'Escape':
      return 'dismiss'
  }
}

export const suggestionShortcuts = (
  context: KeyContext
): SuggestionShortcut[] => {
  const descriptions: Record<SuggestionAction, string> = {
    preview: '補完',
    next: '移動',
    previous: '移動',
    confirm: '確定',
    descend: '子へ移動',
    'append-path': '子へ移動',
    'append-effect': '補完',
    dismiss: '閉じる'
  }

  const hints = [
    { keys: ['Tab'], description: descriptions[tabAction(context)] }
  ]

  if (context.canAppendEffect)
    hints.push({ keys: ['.'], description: descriptions['append-effect'] })

  if (context.count > 1)
    hints.push({ keys: ['↑', '↓'], description: descriptions.next })

  if (context.canDescend)
    hints.push({ keys: ['/', '→'], description: descriptions.descend })
  else if (context.hasChildTarget)
    hints.push({ keys: ['→'], description: descriptions.descend })

  hints.push({ keys: ['Enter'], description: descriptions.confirm })

  return Object.entries(Object.groupBy(hints, hint => hint.description)).map(
    ([description, group]) => ({
      keys: group?.flatMap(hint => hint.keys) ?? [],
      description
    })
  )
}
