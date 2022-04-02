import { format } from '/@/lib/tts/format'
import type { Store } from '@traptitech/traq-markdown-it'
import { traQMarkdownIt } from '@traptitech/traq-markdown-it'

const embeddingOrigin = 'https://example.com'
const storeProvider: Store = {
  getChannel: id => ({ id }),
  getMe: () => ({ id: '' }),
  getStampByName: name => ({ name, fileId: '' }),
  getUser: id => ({ id }),
  getUserByName: name => ({ iconFileId: '' }),
  getUserGroup: id => ({ members: [] }),
  generateChannelHref: () => '',
  generateUserHref: () => '',
  generateUserGroupHref: () => ''
}
const md = new traQMarkdownIt(storeProvider, [], embeddingOrigin)
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
[google](https://www.google.co.jp)
:traq:
:traq.ex-large:
!!かくれてる!!
$\\KaTeX$
https://example.com/files/00000000-0000-0000-0000-000000000000
$$
\\KaTeX
$$
\`\`\`js
console.log('po)
\`\`\`
\`ctrl\`
`

const output = ` 添付メッセージ
@temma
www.google.co.jpドメインのURL
google
 traqスタンプ
 traq.ex-largeスタンプ
 ﾍﾟｹﾍﾟｹ
 数式
 添付ファイル
数式

コードブロック
ctrl`
