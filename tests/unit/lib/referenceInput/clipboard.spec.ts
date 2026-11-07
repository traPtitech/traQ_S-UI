import {
  decodeClipboard,
  decodeClipboardHtml,
  encodeClipboard,
  encodeClipboardHtml
} from '/@/lib/referenceInput/clipboard'
import {
  type Reference,
  encodeReference,
  parseInput,
  serializeInput
} from '/@/lib/references'

const reference: Reference = { type: 'user', id: 'selected-id', raw: '@alice' }
const embedded = encodeReference(reference)

describe('structured clipboard', () => {
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
