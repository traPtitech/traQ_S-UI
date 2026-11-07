import {
  type Reference,
  encodeReference,
  parseInput,
  serializeInput
} from '/@/lib/references'

const reference: Reference = { type: 'user', id: 'selected-id', raw: '@alice' }
const embedded = encodeReference(reference)

describe('reference input persistence', () => {
  it('recovers from unfinished markers without losing the source', () => {
    const prefix = '!{'.repeat(20000)

    expect(serializeInput(parseInput(prefix + embedded, 'message'))).toBe(
      prefix + embedded
    )
    expect(parseInput(prefix + embedded, 'message').at(-1)).toMatchObject({
      type: 'reference',
      reference
    })
  })

  it.each([
    { type: 'user', kind: 'dm' },
    { type: 'search-from', kind: 'channel' },
    { type: 'search-in', kind: 'group' }
  ])('preserves invalid reference kinds as text', invalid => {
    const source = '!' + JSON.stringify({ ...reference, ...invalid })

    expect(
      parseInput(
        source,
        invalid.type.startsWith('search-') ? 'search' : 'message'
      )
    ).toEqual([{ type: 'text', text: source }])
  })

  it.each([
    '  **bold**\t\n\nlast  \n',
    '@alice #general are ordinary text',
    '```ts\n  a = 1\n```\n$$x+y$$',
    '!{"type":"future","id":"unknown","raw":"keep me","extra":42}',
    '!{"type":"user","raw":"@broken"}',
    `a ${embedded}\n\nend\n`,
    '!{ "type": "user", "raw": "@alice", "id": "selected-id", "future": 1 }'
  ])('preserves source text exactly: %s', source => {
    expect(serializeInput(parseInput(source, 'message'))).toBe(source)
  })

  it('parses escaped quotes and braces without truncating the label', () => {
    const value = { ...reference, raw: '@a"}b\\c' }

    expect(parseInput(encodeReference(value), 'message')).toMatchObject([
      { type: 'reference', reference: value }
    ])
  })
})
