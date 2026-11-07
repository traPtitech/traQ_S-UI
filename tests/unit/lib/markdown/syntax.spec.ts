import { markdownParser } from '/@/lib/markdown/syntax'

it.each([
  '***bold*** ~~strike~~ ==mark== !!spoiler!!',
  '$x^2$\n\n$$\nx+1\n$$',
  '$$5 $ x$ $x $ $x$2 $x\\$y$ $x\\\\$ end',
  '$unclosed $$ $ $\t$ a$1$ b$2$3',
  '> $$\n> x + y\n> $$\n\n- $$x$$\n  end',
  '$$unclosed\n\n  body\n- stop',
  ':test.large: :@alice: :hsl(120, 50.5%, 40.5%).spin:',
  '> - **nested**\n>   `literal`\n\n\tindented',
  '| a | b |\n| --- | --- |\n| **x** | \\| y |',
  '[label][ref]\n\n[ref]: https://example.com',
  '![label][ref]\n\n[ref]: https://example.com/image.png',
  'https://example.dev/a_b_c and <https://example.com>',
  '```js\nconst x = 1\n```\r\n\r\nend'
])('matches the message syntax for %s', source => {
  expect(markdownParser.parseWithSyntax(source).document.document).toEqual(
    markdownParser.parse(source).document
  )
})
