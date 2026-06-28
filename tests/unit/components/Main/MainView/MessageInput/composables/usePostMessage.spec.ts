import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'

import { createContent } from '/@/components/Main/MainView/MessageInput/composables/usePostMessage'
import { buildFilePathForPost, embeddingOrigin } from '/@/lib/apis'
import { nullUuid } from '/@/lib/basic/uuid'

vi.mock('/@/lib/markdown/markdown', () => ({
  isEmbeddedLink: vi.fn((text: string) => text.startsWith(embeddingOrigin))
}))

describe('usePostMessage', () => {
  describe('createContent', () => {
    beforeAll(() => {
      createTestingPinia()
    })

    it.each(TEST_CASES)('$description', async ({ input, files, expected }) => {
      const content = await createContent(input, files ?? [])
      expect(content).toBe(expected)
    })
  })
})

const FILES = ['fileUrl1', 'fileUrl2']
const FILE_LINKS = FILES.join('\n')
const LINK = buildFilePathForPost(nullUuid)
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
