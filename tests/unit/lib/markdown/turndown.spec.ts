import { setupTurndown } from '/@/lib/markdown/turndown'

describe('turndown', () => {
  const turndown = setupTurndown()

  const testcases = [
    {
      name: 'should convert h1 to #',
      input: '<h1>po</h1>',
      output: '# po'
    },
    {
      name: 'should convert h6 to ######',
      input: '<h6>po</h6>',
      output: '###### po'
    },
    {
      name: 'should not convert h7 to ######',
      input: '<h7>po</h7>',
      output: 'po'
    },
    {
      name: 'should convert hr to "---"',
      input: '<hr />',
      output: '---'
    },
    {
      name: 'should convert unordered list to "-"',
      input: '<ul><li>foo</li><li>bar</li></ul>',
      output: '-   foo\n-   bar'
    },
    {
      name: 'should convert code to "```"',
      input: '<code>console.log("po")</code>',
      output: '`console.log("po")`'
    },
    {
      name: 'should convert italic to "*"',
      input: '<i>italic</i>',
      output: '*italic*'
    },
    {
      name: 'should convert bold to "**"',
      input: '<b>bold</b>',
      output: '**bold**'
    },
    {
      name: 'should convert strikethrough',
      input: '<s>strikethrough</s>',
      output: '~strikethrough~'
    },
    {
      name: 'should convert table',
      input: `
        <table>
          <tr><th>a</th><th>1</th></tr>
          <tr><td>b</td><td>2</td></tr>
        </table>`,
      output: `

| a | 1 |
| --- | --- |
| b | 2 |
              `.trim()
    },
    {
      name: 'should convert link',
      input: '<a href="https://trap.jp">https://trap.jp</a>',
      output: 'https://trap.jp'
    },
    {
      name: 'should convert link with titile',
      input: '<a href="https://trap.jp">traP公式サイト</a>',
      output: '[traP公式サイト](https://trap.jp)'
    },
    {
      name: 'should convert mark',
      input: '<mark>mark</mark>',
      output: '==mark=='
    },
    {
      name: 'should remove style',
      input: '<style>div{color:red}</style>',
      output: ''
    },
    {
      name: 'should remove script',
      input: '<script>console.log("po")</script>',
      output: ''
    }
  ]

  for (const { name, input, output } of testcases) {
    it.concurrent(name, () => {
      const actual = turndown.turndown(input)
      expect(actual).toBe(output)
    })
  }
})
