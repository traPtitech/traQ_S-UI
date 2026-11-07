import { encodeReference } from '/@/lib/references'

export const corpusReference = encodeReference({
  type: 'user',
  id: 'stable-user-id',
  raw: '@alice'
})

const inline =
  '**bold** _em_ ~~strike~~ ==mark== !!hidden!! `code` $x^2$ :test: ![image][asset] example.dev'

export const markdownCorpus = [
  ['LF', '\n'],
  ['CRLF', '\r\n'],
  ['CR', '\r']
].flatMap(([lineEnding, newline]) =>
  [
    ['paragraph', ''],
    ['quote', '> '],
    ['list', '- '],
    ['quoted-list', '> - ']
  ].map(([container, prefix]) => ({
    name: lineEnding + '/' + container,
    source: [
      prefix + '😀 日本語 ' + inline + ' ' + corpusReference,
      '',
      '[asset]: https://example.com/image.png "title"',
      '',
      '| first | second |',
      '| --- | --- |',
      '| **table** | a\\|b |',
      '',
      '- item',
      '  ```ts',
      '  ' + corpusReference,
      '  ```',
      '',
      '$$',
      'x + y',
      '$$',
      '',
      '\\*escaped\\* unfinished !{ **',
      'embedded NUL \0'
    ].join(newline)
  }))
)
