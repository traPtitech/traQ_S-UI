import { nilUuid } from '/@/lib/basic/uuid'
import { normalizeMessageSource } from '/@/lib/message/content'
import { createMessageContentBuilder } from '/@/lib/message/content'
import {
  type Reference,
  encodeReference,
  parseInput,
  partsToDisplayText
} from '/@/lib/references'

const EMBEDDING_ORIGIN = 'https://q.example.com'

describe('createMessageContentBuilder', () => {
  it.each(TEST_CASES)('$description', ({ input, files, expected }) => {
    const content = createMessageContentBuilder(
      input,
      EMBEDDING_ORIGIN
    )(files ?? [])
    expect(content).toBe(expected)
  })
})

const FILES = ['fileUrl1', 'fileUrl2']
const FILE_LINKS = FILES.join('\n')
const LINK = `${EMBEDDING_ORIGIN}/files/${nilUuid}`
const LINE_BREAKS = '\n\n\n\n\n'
const SPACES = '     '

interface TestCase {
  description: string
  input: string
  files?: string[]
  expected: string
}

const TEST_CASES: TestCase[] = [
  {
    description: 'empty',
    input: '',
    expected: ''
  },
  {
    description: 'text',
    input: 'test text',
    expected: 'test text'
  },
  {
    description: 'link',
    input: LINK,
    expected: LINK
  },
  {
    description: 'text + link',
    input: `test text\n${LINK}`,
    expected: `test text\n${LINK}`
  },
  {
    description: 'line breaks',
    input: LINE_BREAKS,
    expected: LINE_BREAKS
  },
  {
    description: 'text + line breaks',
    input: `test text${LINE_BREAKS}`,
    expected: `test text${LINE_BREAKS}`
  },
  {
    description: 'link + line breaks',
    input: `${LINK}${LINE_BREAKS}`,
    expected: `${LINK}`
  },
  {
    description: 'text + link + line breaks',
    input: `test text\n${LINK}${LINE_BREAKS}`,
    expected: `test text\n${LINK}`
  },
  {
    description: 'empty + files',
    input: '',
    files: FILES,
    expected: FILE_LINKS
  },
  {
    description: 'text + files',
    input: 'test text',
    files: FILES,
    expected: `test text\n\n${FILE_LINKS}`
  },
  {
    description: 'link + files',
    input: LINK,
    files: FILES,
    expected: `${LINK}\n${FILE_LINKS}`
  },
  {
    description: 'lookalike origin + files',
    input: `${EMBEDDING_ORIGIN}.example.net/files/${nilUuid}`,
    files: FILES,
    expected: `${EMBEDDING_ORIGIN}.example.net/files/${nilUuid}\n${FILE_LINKS}`
  },
  {
    description: 'origin in credentials + files',
    input: `${EMBEDDING_ORIGIN}@example.net/files/${nilUuid}`,
    files: FILES,
    expected: `${EMBEDDING_ORIGIN}@example.net/files/${nilUuid}\n${FILE_LINKS}`
  },
  {
    description: 'text + link + files',
    input: `test text\n${LINK}`,
    files: FILES,
    expected: `test text\n${LINK}\n${FILE_LINKS}`
  },
  {
    description: 'line breaks + files',
    input: LINE_BREAKS,
    files: FILES,
    expected: `${LINE_BREAKS}\n${FILE_LINKS}`
  },
  {
    description: 'text + line breaks + files',
    input: `test text${LINE_BREAKS}`,
    files: FILES,
    expected: `test text${LINE_BREAKS}\n\n${FILE_LINKS}`
  },
  {
    description: 'link + line breaks + files',
    input: `${LINK}${LINE_BREAKS}`,
    files: FILES,
    expected: `${LINK}\n${FILE_LINKS}`
  },
  {
    description: 'text + link + line breaks + files',
    input: `test text\n${LINK}${LINE_BREAKS}`,
    files: FILES,
    expected: `test text\n${LINK}\n${FILE_LINKS}`
  },
  {
    description: 'bullet point link + files',
    input: `- ${LINK}`,
    files: FILES,
    expected: `- ${LINK}\n\n${FILE_LINKS}`
  },
  {
    description: 'bullet point link + line breaks + files',
    input: `- ${LINK}${LINE_BREAKS}`,
    files: FILES,
    expected: `- ${LINK}${LINE_BREAKS}\n\n${FILE_LINKS}`
  },
  {
    description: 'spaces + files',
    input: SPACES,
    files: FILES,
    expected: `${SPACES}\n${FILE_LINKS}`
  },
  {
    description: 'text ending with space',
    input: 'test text ',
    expected: 'test text '
  },
  {
    description: 'mixed whitespace',
    input: ' \t\n ',
    expected: ' \t\n '
  },
  {
    description: 'mixed whitespace + files',
    input: ' \t\n ',
    files: FILES,
    expected: ` \t\n \n${FILE_LINKS}`
  },
  {
    description: 'text ending with newline',
    input: 'test text\n',
    expected: 'test text\n'
  },
  {
    description: 'text ending with newline + files',
    input: 'test text\n',
    files: FILES,
    expected: `test text\n\n\n${FILE_LINKS}`
  },
  {
    description: 'link ending with newline + files',
    input: `${LINK}\n`,
    files: FILES,
    expected: `${LINK}\n${FILE_LINKS}`
  }
]

const reference: Reference = { type: 'user', id: 'selected-id', raw: '@alice' }
const embedded = encodeReference(reference)

describe('message reference normalization', () => {
  it('keeps hand-typed names as text and explicit references as IDs', () => {
    expect(normalizeMessageSource(`@alice ${embedded}`)).toBe(
      `@alice ${embedded}`
    )
    expect(partsToDisplayText(parseInput(embedded, 'message'))).toBe('@alice')
  })

  it.each([
    ['`', '`'],
    ['``', '``'],
    ['```js\n', '\n```'],
    ['~~~\n', '\n~~~'],
    ['> ```\n> ', '\n> ```'],
    ['    ', ''],
    ['$', '$'],
    ['$$\n', '\n$$'],
    ['```\n', '']
  ])('removes reference semantics inside %s … %s', (before, after) => {
    expect(normalizeMessageSource(`${before}${embedded}${after}`)).toBe(
      `${before}@alice${after}`
    )
  })

  it('keeps references after a closed code block active', () => {
    expect(normalizeMessageSource(`~~~\n${embedded}\n~~~\n${embedded}`)).toBe(
      `~~~\n@alice\n~~~\n${embedded}`
    )
  })

  it('distinguishes list indentation from an indented code block', () => {
    const source = `1. item\n\n    ${embedded}\n\n        ${embedded}`

    expect(normalizeMessageSource(source)).toBe(
      `1. item\n\n    ${embedded}\n\n        @alice`
    )
  })

  it('handles nested list fences and escaped inline delimiters', () => {
    expect(normalizeMessageSource(`- item\n  ~~~\n  ${embedded}\n  ~~~`)).toBe(
      '- item\n  ~~~\n  @alice\n  ~~~'
    )

    expect(normalizeMessageSource(`\\\`${embedded}\\\``)).toBe(
      `\\\`${embedded}\\\``
    )
  })
})
