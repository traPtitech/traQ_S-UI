import { readFile } from 'node:fs/promises'

import { createRuntime, presets } from '@traq-flavored-markdown/sdk'

import { format } from '/@/lib/tts/format'

const embeddingOrigin = 'https://example.com'
const runtime = await createRuntime(
  await readFile('node_modules/@traq-flavored-markdown/sdk/dist/parser.wasm')
)
const parser = runtime.createParser(presets.traq.v1)
const parse = (text: string) => parser.parse(text)
afterAll(() => runtime.dispose())
describe('tts format', () => {
  it('can format', () => {
    expect(format(parse(input), embeddingOrigin).replace(/ +$/gm, '')).toEqual(
      output
    )
  })

  it.each([
    ['two trailing spaces', 'first  \nsecond'],
    ['a trailing backslash', 'first\\\nsecond']
  ])('preserves a hard break from %s', (_name, input) => {
    expect(format(parse(input), embeddingOrigin)).toEqual('first\nsecond')
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
