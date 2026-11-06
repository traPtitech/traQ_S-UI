import { Schema } from '@tiptap/pm/model'

import {
  type SuggestionState,
  appendSuggestionEffect,
  confirmSuggestion,
  continueSuggestionPath,
  descendSuggestionPath,
  keepsSuggestionCycle,
  previewSuggestion,
  suggestTarget,
  suggestionKeyAction,
  suggestionShortcuts
} from '/@/lib/referenceInput/suggestionState'
import type { Candidate } from '/@/lib/suggestion/types'

const schema = new Schema({ nodes: { doc: { content: 'text*' }, text: {} } })
const createDocument = (text: string) =>
  schema.node('doc', null, schema.text(text))

const dmChannelId = () => undefined
const userCandidates: Candidate[] = [
  { word: { type: 'user', id: 'alice', text: '@alice' } },
  { word: { type: 'user', id: 'alex', text: '@alex' } }
]

it('retains the original candidate set while cycling and bounds the edit to the target', () => {
  const doc = createDocument('before @al after')
  const state = suggestTarget({
    mode: 'message',
    intent: 'mention',
    word: '@al',
    from: 8,
    to: 11
  })
  if (state.status === 'closed') throw new Error('Missing target')

  const first = previewSuggestion(
    state,
    userCandidates,
    doc,
    { direction: 'next', initialSelection: 'boundary' },
    dmChannelId
  )
  expect(first?.edit).toEqual({
    parts: [{ type: 'text', text: '@alice' }],
    range: state.target
  })
  const cycling = first?.nextState
  if (cycling?.status !== 'cycling') throw new Error('Missing cycle')

  expect(cycling.candidates).toBe(userCandidates)
  expect(cycling.target).toMatchObject({ from: 8, to: 14, word: '@al' })
  expect(keepsSuggestionCycle(cycling, doc, { from: 14, to: 14 })).toBe(true)
  expect(keepsSuggestionCycle(cycling, doc, { from: 13, to: 13 })).toBe(false)
  expect(
    keepsSuggestionCycle(cycling, createDocument('changed'), {
      from: 14,
      to: 14
    })
  ).toBe(false)

  const previous = previewSuggestion(
    cycling,
    userCandidates,
    doc,
    { direction: 'previous', initialSelection: 'advance' },
    dmChannelId
  )
  expect(previous?.nextState).toMatchObject({
    selection: { type: 'candidate', index: 1 }
  })
  expect(previous?.edit?.range).toBe(cycling.target)
})

it('preserves the replacement range when descending into a channel path', () => {
  const state: SuggestionState = {
    status: 'suggesting',
    target: { mode: 'search', operator: 'in', word: '#te', from: 1, to: 7 },
    selection: { type: 'candidate', index: 0 }
  }
  const word = { type: 'channel', id: 'team', text: '#team' } as const
  const descended = descendSuggestionPath(state, word, dmChannelId)
  expect(descended?.nextState).toEqual({
    status: 'suggesting',
    target: { ...state.target, word: '#team' },
    selection: { type: 'parent' }
  })
  expect(descended?.edit).toBeUndefined()
  expect(continueSuggestionPath(state, word, true, dmChannelId)?.edit).toEqual({
    parts: [{ type: 'text', text: 'in:#team/' }],
    range: state.target
  })
})

it('records stamp usage only when a candidate is confirmed', () => {
  const state = suggestTarget({
    mode: 'message',
    intent: 'stamp',
    word: ':te',
    from: 1,
    to: 4
  })
  const word = { type: 'stamp', id: 'test', text: ':test' } as const

  expect(confirmSuggestion(state, word, dmChannelId)).toMatchObject({
    nextState: { status: 'closed' },
    edit: { parts: [{ type: 'text', text: ':test: ' }] },
    effects: { recordStamp: 'test' }
  })
  expect(appendSuggestionEffect(state, word, dmChannelId)).toMatchObject({
    edit: { parts: [{ type: 'text', text: ':test.' }] },
    effects: { refreshTarget: true }
  })
  expect(
    confirmSuggestion({ status: 'closed' }, word, dmChannelId)
  ).toBeUndefined()
})

const context = {
  cycling: false,
  count: 1,
  canDescend: false,
  hasChildTarget: false,
  canAppendEffect: false
}

it.each([
  [{}, 'preview', '補完'],
  [{ cycling: true }, 'confirm', '確定'],
  [{ cycling: true, count: 2 }, 'next', '移動'],
  [{ cycling: true, canDescend: true }, 'descend', '子へ移動']
] as const)(
  'keeps the Tab action and its hint consistent for %j',
  (overrides, action, description) => {
    const current = { ...context, ...overrides }
    expect(
      suggestionKeyAction(new KeyboardEvent('keydown', { key: 'Tab' }), current)
    ).toBe(action)
    expect(
      suggestionShortcuts(current).find(hint => hint.keys.includes('Tab'))
        ?.description
    ).toBe(description)
  }
)

it.each(['ctrlKey', 'metaKey', 'altKey'] as const)(
  'leaves modified shortcuts to the host: %s',
  modifier => {
    for (const key of ['Tab', 'Enter', 'ArrowRight', '/', '.'])
      expect(
        suggestionKeyAction(
          new KeyboardEvent('keydown', { key, [modifier]: true }),
          { ...context, canAppendEffect: true }
        )
      ).toBeUndefined()
  }
)

it.each([false, true])(
  'offers dot completion only for stamps, with cycling %s',
  cycling => {
    for (const canAppendEffect of [false, true]) {
      const current = { ...context, cycling, canAppendEffect }
      expect(
        suggestionKeyAction(new KeyboardEvent('keydown', { key: '.' }), current)
      ).toBe(canAppendEffect ? 'append-effect' : undefined)
      expect(
        suggestionShortcuts(current).find(hint => hint.keys.includes('.'))
          ?.description
      ).toBe(canAppendEffect ? '補完' : undefined)
    }
  }
)

it('allows Shift+Tab to cycle backward and leaves Shift+Enter to the host', () => {
  expect(
    suggestionKeyAction(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }),
      context
    )
  ).toBe('previous')
  expect(
    suggestionKeyAction(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }),
      context
    )
  ).toBeUndefined()
})
