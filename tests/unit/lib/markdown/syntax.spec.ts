import { type Store, traQMarkdownIt } from '@traptitech/traq-markdown-it'

import type Token from 'markdown-it/lib/token.mjs'

import { createMarkdownAnalysisParser } from '/@/lib/markdown/syntax'

const store: Store = {
  getUser: () => undefined,
  getChannel: id => ({ id }),
  getUserGroup: () => undefined,
  getMe: () => undefined,
  getStampByName: () => undefined,
  getUserByName: () => undefined,
  generateChannelHref: () => '',
  generateUserHref: () => '',
  generateUserGroupHref: () => ''
}

const renderer = new traQMarkdownIt(store, [], 'https://example.com')
const parser = createMarkdownAnalysisParser()

const syntax = (tokens: Token[]): unknown[] =>
  tokens.map(token => ({
    type: token.type,
    tag: token.tag,
    nesting: token.nesting,
    content: token.content,
    markup: token.markup,
    map: token.map,
    children: token.children ? syntax(token.children) : null
  }))

it.each([
  '***bold*** ~~strike~~ ==mark== !!spoiler!!',
  '$x^2$\n\n$$\nx+1\n$$',
  ':test.large: :@alice: :hsl(120, 50.5%, 40.5%).spin:',
  '> - **nested**\n>   `literal`\n\n\tindented',
  '| a | b |\n| --- | --- |\n| **x** | \\| y |',
  '[label][ref]\n\n[ref]: https://example.com',
  '![label][ref]\n\n[ref]: https://example.com/image.png',
  'https://example.dev/a_b_c and <https://example.com>',
  '```js\nconst x = 1\n```\r\n\r\nend'
])('matches the message syntax for %s', source => {
  expect(syntax(parser.parse(source, {}))).toEqual(
    syntax(renderer.md.parse(source, {}))
  )
})
