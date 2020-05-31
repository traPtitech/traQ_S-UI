import { format } from '@/lib/tts'
import MarkdownIt, { Store } from '@traptitech/traq-markdown-it'

const embeddingOrigin = 'https://example.com'
const storeProvider: Store = {
  getChannel: id => ({ id }),
  getChannelPath: id => '',
  getMe: () => ({ id: '' }),
  getStampByName: name => ({ name, fileId: '' }),
  getUser: id => ({ id }),
  getUserByName: name => ({ iconFileId: '' }),
  getUserGroup: id => ({ members: [] })
}
const md = new MarkdownIt(storeProvider, [], embeddingOrigin)
const parse = (text: string) => {
  return md.md.parse(text, {})
}

describe('tts format', () => {
  it('can format', () => {
    expect(format(parse(input), embeddingOrigin).replace(/ +$/gm, '')).toEqual(
      output
    )
  })
})

const input = `
https://example.com/messages/00000000-0000-0000-0000-000000000000
!{"type":"user","raw":"@temma","id":"00000000-0000-0000-0000-000000000000"}
https://www.google.co.jp
:traq:
:traq.ex-large:
$\\KaTeX$
https://example.com/files/00000000-0000-0000-0000-000000000000
$$
\\KaTeX
$$
`

const output = ` 添付メッセージ
@temma
www.google.co.jpドメインのURL


 数式
 添付ファイル
数式
`
