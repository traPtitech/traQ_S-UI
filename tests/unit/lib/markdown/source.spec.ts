import { type Store, traQMarkdownIt } from '@traptitech/traq-markdown-it'

import { trackMarkdownSource } from '/@/lib/markdown/compatibility/source'

const store: Store = {
  getChannel: id => ({ id }),
  getMe: () => ({ id: 'me' }),
  getStampByName: name => ({ name, fileId: 'stamp' }),
  getUser: id => ({ id }),
  getUserByName: () => ({ iconFileId: 'icon' }),
  getUserGroup: () => ({ members: [] }),
  generateChannelHref: id => `/channels/${id}`,
  generateUserHref: id => `/users/${id}`,
  generateUserGroupHref: id => `/groups/${id}`
}

const original = new traQMarkdownIt(store, [], 'https://example.com')
const tracked = new traQMarkdownIt(store, [], 'https://example.com')
tracked.md.use(trackMarkdownSource)

describe('Markdown source positions', () => {
  it.each([
    '**example.dev** and https://example.com/a_b_c',
    '\\*example.com example.dev',
    'http\\://example.com and example.dev',
    'https://xn--bcher-kva.example.com/path example.dev',
    '> [**link**](https://example.com)\n> example.dev',
    '| link | stamp |\n| --- | --- |\n| example.dev | :traq: |',
    ':traq.large: and **:@alice:**',
    '![alt](https://example.com/image.png)',
    '!{"type":"user","id":"user","raw":"@alice"}',
    '!{"type":"channel","id":"channel","raw":"#general"}',
    '!{"type":"group","id":"group","raw":"@group"}',
    '$x^2$ and !!secret!!\n\n```\nexample.com\n```'
  ])('preserves the message renderer output and embeddings for %s', text => {
    expect(tracked.render(text)).toEqual(original.render(text))
    expect(tracked.renderInline(text)).toEqual(original.renderInline(text))
  })

  it('retains stamp metadata alongside its original source position', () => {
    const text = 'before :traq.large: after'

    const stamp = tracked.md
      .parse(text, {})
      .flatMap(token => token.children ?? [])
      .find(token => token.meta?.match)

    expect(stamp?.meta.match[0]).toBe(':traq.large:')
    expect(stamp?.meta.source).toEqual({ from: 7, to: 19 })
  })
})
