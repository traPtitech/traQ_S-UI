import { formatUrl } from '/@/lib/tts/format'

const embeddingOrigin = 'https://example.com'

describe('tts formatUrl', () => {
  it('can format url', () => {
    expect(formatUrl('https://q.trap.jp', embeddingOrigin)).toBe(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format http url', () => {
    expect(formatUrl('http://q.trap.jp', embeddingOrigin)).toBe(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format websocket url', () => {
    expect(formatUrl('wss://q.trap.jp', embeddingOrigin)).toBe(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format url without protocol', () => {
    expect(formatUrl('q.trap.jp', embeddingOrigin)).toBe(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format embedded message', () => {
    expect(formatUrl('https://example.com/messages/', embeddingOrigin)).toBe(
      ' 添付メッセージ '
    )
  })
  it('can format embedded file', () => {
    expect(formatUrl('https://example.com/files/', embeddingOrigin)).toBe(
      ' 添付ファイル '
    )
  })
  it('can format url of embeddingOrigin', () => {
    expect(
      formatUrl('https://example.com/channels/general', embeddingOrigin)
    ).toBe('example.comドメインのURL')
  })
  it('can format invalid domain url', () => {
    expect(formatUrl('https://p%o.com', embeddingOrigin)).toBe(
      '不明なドメインのURL'
    )
  })
})
