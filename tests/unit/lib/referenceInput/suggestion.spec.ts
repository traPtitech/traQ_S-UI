import {
  acceptsCandidate,
  completedChannelPath,
  confirmCandidateParts,
  findSuggestionTarget,
  previewCandidateText
} from '/@/lib/referenceInput/suggestion'
import { type InputMode, type SearchOperator } from '/@/lib/references'
import type { SuggestionWord } from '/@/lib/suggestion/types'

const user: SuggestionWord = { type: 'user', id: 'user-id', text: '@alice' }
const group: SuggestionWord = {
  type: 'user-group',
  id: 'group-id',
  text: '@team'
}
const channel: SuggestionWord = {
  type: 'channel',
  id: 'channel-id',
  text: '#times/25'
}
const stamp: SuggestionWord = { type: 'stamp', id: 'stamp-id', text: ':stamp' }
const dm = (id: string) => (id === user.id ? 'dm-id' : undefined)

const targetFor = (text: string, mode: InputMode = 'message') => {
  const target = findSuggestionTarget(text, text.length + 1, mode)
  if (!target) throw new Error('Expected a completion target')

  return target
}

describe('reference suggestion rules', () => {
  it.each([
    ':ng:',
    ':ng:a',
    'before:ng:a',
    ':ng.large.rotate:a',
    ':ng::ok:a',
    ':@alice:a',
    ':@Webhook#bot:a',
    ':hex(ff0000):a',
    ':hsl(120, 100%, 50%):a'
  ])('does not reuse a completed stamp closing colon: %s', text => {
    expect(
      findSuggestionTarget(text, text.length + 1, 'message')
    ).toBeUndefined()
  })

  it.each([':a', ':ng::a', ':ng: :a', ':ng:\n:a', ':ng:word:a', '\\:ng:a'])(
    'allows a new stamp opening colon: %s',
    text => {
      expect(targetFor(text)).toEqual({
        mode: 'message',
        intent: 'stamp',
        word: ':a',
        from: text.length - 1,
        to: text.length + 1
      })
    }
  )

  it.each([
    [':ng:@al', 'mention'],
    [':ng:＠al', 'mention'],
    [':ng::@al', 'user-icon'],
    [':ng::＠al', 'user-icon']
  ])(
    'distinguishes an icon opening colon after a stamp: %s',
    (text, intent) => {
      expect(targetFor(text)).toMatchObject({ intent })
    }
  )

  it.each([
    ['message', 'hello @al', '@al', 7, false],
    ['message', '\uFFFC#times/2', '#times/2', 2, false],
    ['message', ':@al', '@al', 2, true],
    ['message', ':＠al', '＠al', 2, true],
    ['search', 'topic by:al', '@al', 7, undefined],
    ['search', 'in:times/2', '#times/2', 1, undefined],
    ['search', 'from:＠al', '＠al', 1, undefined]
  ] as const)(
    'finds the editable suffix in %s: %s',
    (mode, text, word, from, icon) => {
      const target = targetFor(text, mode)

      expect(target).toMatchObject({ word, from, to: text.length + 1 })

      if (target.mode === 'message')
        expect(target.intent === 'user-icon').toBe(icon)

      if (text.includes('by:'))
        expect(target).toMatchObject({ operator: 'from' })
    }
  )

  it.each(['plain text', 'from:alice ', '\uFFFC'])(
    'does not reopen a completed or separated search: %s',
    text => {
      expect(
        findSuggestionTarget(text, text.length + 1, 'search')
      ).toBeUndefined()
    }
  )

  it.each([
    ':test.',
    ':test.la',
    ':test.large.ro',
    ':@alice.',
    ':@alice.ro',
    ':@Webhook#bot.ro',
    ':0xff0000.ro',
    ':hsl(120, 100%, 50%).ro'
  ])('finds effects inside an open stamp: %s', text => {
    expect(targetFor(text)).toMatchObject({
      intent: 'stamp-effect',
      word: text.slice(text.lastIndexOf('.'))
    })
  })

  it.each([
    '.',
    'text.',
    'file.la',
    ':test:.',
    ':test:word.la',
    ':@alice:.ro',
    'https://example.',
    'https://example.ro',
    '\\:test.ro',
    '```\n:test.ro'
  ])('does not offer stamp effects outside an open stamp: %s', text => {
    expect(
      findSuggestionTarget(text, text.length + 1, 'message')
    ).toBeUndefined()
  })

  it.each([
    [':st', stamp, ':stamp'],
    [':@al', user, '@alice'],
    [':stamp.la', { type: 'stamp-effect', text: '.large' }, '.large']
  ] satisfies Array<[string, SuggestionWord, string]>)(
    'closes %s only when confirming',
    (text, word, completed) => {
      const target = targetFor(text)
      expect(previewCandidateText(target, word, dm)).toBe(completed)
      expect(confirmCandidateParts(target, word, dm)).toEqual([
        { type: 'text', text: completed + ': ' }
      ])
    }
  )

  it.each([':stamp', ':@alice', ':0xff0000', ':hsl(120, 50.5%, 40.5%)'])(
    'limits %s to five animations, counting repeats and aliases but not sizes',
    prefix => {
      const animations = '.atsumori.atsumori.conga.flashy'
      const fifth = targetFor(prefix + '.large' + animations + '.a')
      const sixth = targetFor(prefix + animations + '.atsumori.large.a')
      const animation: SuggestionWord = {
        type: 'stamp-effect',
        text: '.atsumori'
      }
      const alias: SuggestionWord = { type: 'stamp-effect', text: '.marquee' }
      const size: SuggestionWord = { type: 'stamp-effect', text: '.small' }

      for (const word of [animation, alias]) {
        expect(acceptsCandidate(fifth, word, dm)).toBe(true)
        expect(acceptsCandidate(sixth, word, dm)).toBe(false)
        expect(previewCandidateText(sixth, word, dm)).toBeUndefined()
        expect(confirmCandidateParts(sixth, word, dm)).toBeUndefined()
      }
      expect(acceptsCandidate(sixth, size, dm)).toBe(true)

      const overLimit = targetFor(prefix + animations + '.atsumori.rotate.')
      expect(acceptsCandidate(overLimit, size, dm)).toBe(false)
    }
  )

  it.each([
    ['from', user, true],
    ['from', group, true],
    ['from', channel, false],
    ['to', user, true],
    ['to', group, true],
    ['to', channel, false],
    ['in', channel, true],
    ['in', user, true],
    ['in', group, false],
    ['in', stamp, false],
    ['from', stamp, false]
  ] satisfies Array<[SearchOperator, SuggestionWord, boolean]>)(
    '%s accepts the proper entity kind: %j',
    (operator, word, allowed) => {
      const target = targetFor(`${operator}:a`, 'search')

      expect(acceptsCandidate(target, word, dm)).toBe(allowed)
      expect(confirmCandidateParts(target, word, dm) !== undefined).toBe(
        allowed
      )
    }
  )

  it('resolves a selected DM to the channel ID and rejects a missing DM', () => {
    const target = targetFor('in:@al', 'search')

    expect(confirmCandidateParts(target, user, dm)).toEqual([
      {
        type: 'reference',
        reference: {
          type: 'search-in',
          id: 'dm-id',
          raw: 'in:@alice',
          kind: 'dm'
        }
      },
      { type: 'text', text: ' ' }
    ])

    expect(confirmCandidateParts(target, user, () => undefined)).toBeUndefined()
  })

  it('keeps user icons as text and selected groups as references', () => {
    expect(confirmCandidateParts(targetFor(':@al'), user, dm)).toEqual([
      { type: 'text', text: '@alice: ' }
    ])

    expect(confirmCandidateParts(targetFor('@te'), group, dm)).toEqual([
      {
        type: 'reference',
        reference: { type: 'group', id: 'group-id', raw: '@team' }
      },
      { type: 'text', text: ' ' }
    ])
  })

  it('keeps path completion as text with the search operator', () => {
    expect(completedChannelPath(targetFor('#times'), channel.text)).toBe(
      '#times/25'
    )

    expect(
      completedChannelPath(targetFor('in:#times', 'search'), channel.text)
    ).toBe('in:#times/25')

    expect(
      completedChannelPath(targetFor('in:#times', 'search'), channel.text + '/')
    ).toBe('in:#times/25/')
  })
})

it.each([':@al', ':＠al'])(
  'rejects group mentions while completing a user icon: %s',
  text => {
    const target = targetFor(text)
    expect(acceptsCandidate(target, group, dm)).toBe(false)
    expect(confirmCandidateParts(target, group, dm)).toBeUndefined()
  }
)
