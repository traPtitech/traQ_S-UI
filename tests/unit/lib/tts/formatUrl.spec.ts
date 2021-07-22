import { formatUrl } from '/@/lib/tts/format'

const embeddingOrigin = 'https://example.com'

describe('tts formatUrl', () => {
  it('can format url', () => {
    expect(formatUrl('https://q.trap.jp', embeddingOrigin)).toEqual(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format http url', () => {
    expect(formatUrl('http://q.trap.jp', embeddingOrigin)).toEqual(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format websocket url', () => {
    expect(formatUrl('wss://q.trap.jp', embeddingOrigin)).toEqual(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format url without protocol', () => {
    expect(formatUrl('q.trap.jp', embeddingOrigin)).toEqual(
      'q.trap.jpドメインのURL'
    )
  })
  it('can format embedded message', () => {
    expect(formatUrl('https://example.com/messages/', embeddingOrigin)).toEqual(
      ' 添付メッセージ '
    )
  })
  it('can format embedded file', () => {
    expect(formatUrl('https://example.com/files/', embeddingOrigin)).toEqual(
      ' 添付ファイル '
    )
  })
  it('can format url of embeddingOrigin', () => {
    expect(
      formatUrl('https://example.com/channels/general', embeddingOrigin)
    ).toEqual('example.comドメインのURL')
  })
  it('can format invalid domain url', () => {
    expect(formatUrl('https://p%o.com', embeddingOrigin)).toEqual(
      '不明なドメインのURL'
    )
  })
})
