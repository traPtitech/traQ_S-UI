import {
  decodeClipboard,
  decodeClipboardHtml,
  encodeClipboard,
  encodeClipboardHtml
} from '/@/lib/referenceInput/clipboard'
import { messageContent } from '/@/lib/referenceInput/message'
import {
  type Reference,
  encodeReference,
  inputText,
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

  it('keeps hand-typed names as text and explicit references as IDs', () => {
    expect(messageContent(`@alice ${embedded}`)).toBe(`@alice ${embedded}`)
    expect(inputText(parseInput(embedded, 'message'))).toBe('@alice')
  })

  it.each([
    ['`', '`'],
    ['``', '``'],
    ['```js\n', '\n```'],
    ['~~~\n', '\n~~~'],
    ['> ```\n> ', '\n> ```'],
    ['    ', ''],
    ['$', '$'],
    ['$$\n', '\n$$'],
    ['```\n', '']
  ])('removes reference semantics inside %s … %s', (before, after) => {
    expect(messageContent(`${before}${embedded}${after}`)).toBe(
      `${before}@alice${after}`
    )
  })

  it('keeps references after a closed code block active', () => {
    expect(messageContent(`~~~\n${embedded}\n~~~\n${embedded}`)).toBe(
      `~~~\n@alice\n~~~\n${embedded}`
    )
  })

  it('distinguishes list indentation from an indented code block', () => {
    const source = `1. item\n\n    ${embedded}\n\n        ${embedded}`

    expect(messageContent(source)).toBe(
      `1. item\n\n    ${embedded}\n\n        @alice`
    )
  })

  it('handles nested list fences and escaped inline delimiters', () => {
    expect(messageContent(`- item\n  ~~~\n  ${embedded}\n  ~~~`)).toBe(
      '- item\n  ~~~\n  @alice\n  ~~~'
    )

    expect(messageContent(`\\\`${embedded}\\\``)).toBe(`\\\`${embedded}\\\``)
  })

  it('only restores matching-server structured clipboard content', () => {
    const parts = parseInput(`Hello ${embedded}`, 'message')
    const data = encodeClipboard(parts, 'message', 'https://traq.example')
    const restored = decodeClipboard(data, 'message', 'https://traq.example')

    expect(restored && serializeInput(restored)).toBe(`Hello ${embedded}`)

    expect(
      decodeClipboard(data, 'message', 'https://other.example')
    ).toBeUndefined()

    expect(
      decodeClipboard(data, 'search', 'https://traq.example')
    ).toBeUndefined()

    expect(
      decodeClipboard('{broken', 'message', 'https://traq.example')
    ).toBeUndefined()
  })

  it('rejects invalid clipboard reference data', () => {
    const invalid = JSON.stringify({
      version: 1,
      mode: 'message',
      origin: 'a',
      parts: [{ type: 'reference', reference: { ...reference, id: null } }]
    })

    expect(decodeClipboard(invalid, 'message', 'a')).toBeUndefined()
  })

  it('preserves IDs through the HTML fallback while escaping markup', () => {
    const parts = parseInput(`<script>alert(1)</script> ${embedded}`, 'message')
    const html = encodeClipboardHtml(parts, 'message', 'https://traq.example')

    expect(
      new DOMParser().parseFromString(html, 'text/html').querySelector('script')
    ).toBeNull()

    const restored = decodeClipboardHtml(
      html,
      'message',
      'https://traq.example'
    )

    expect(restored && serializeInput(restored)).toBe(
      `<script>alert(1)</script> ${embedded}`
    )

    expect(
      decodeClipboardHtml(html, 'message', 'https://other.example')
    ).toBeUndefined()
  })
})
