import { createTestingPinia } from '@pinia/testing'
import { createContent } from '/@/components/Main/MainView/MessageInput/composables/usePostMessage'
import { nullUuid } from '/@/lib/basic/uuid'
import { buildFilePathForPost } from '/@/lib/apis'

const FILES = ['fileUrl1', 'fileUrl2']
const FILE_LINKS = FILES.join('\n')
const LINK = buildFilePathForPost(nullUuid)
const LINE_BREAKS = '\n\n\n\n\n'

describe('usePostMessage', () => {
  describe('createContent', () => {
    beforeAll(() => {
      createTestingPinia()
    })

    it('normal text + links', async () => {
      const content = await createContent('test text', FILES)
      expect(content).toBe(`test text\n\n${FILE_LINKS}`)
    })
    it('empty', async () => {
      const content = await createContent('', [])
      expect(content).toBe('')
    })
    it('text', async () => {
      const content = await createContent('test text', [])
      expect(content).toBe('test text')
    })
    it('link', async () => {
      const content = await createContent(LINK, [])
      expect(content).toBe(LINK)
    })
    it('text + link', async () => {
      const content = await createContent(`test text\n${LINK}`, [])
      expect(content).toBe(`test text\n${LINK}`)
    })
    it('line breaks', async () => {
      const content = await createContent(LINE_BREAKS, [])
      expect(content).toBe(LINE_BREAKS)
    })
    it('text + line breaks', async () => {
      const content = await createContent(`test text${LINE_BREAKS}`, [])
      expect(content).toBe(`test text${LINE_BREAKS}`)
    })
    it('link + line breaks', async () => {
      const content = await createContent(`${LINK}${LINE_BREAKS}`, [])
      expect(content).toBe(`${LINK}${LINE_BREAKS}`)
    })
    it('text + link + line breaks', async () => {
      const content = await createContent(
        `test text\n${LINK}${LINE_BREAKS}`,
        []
      )
      expect(content).toBe(`test text\n${LINK}${LINE_BREAKS}`)
    })
    it('empty + files', async () => {
      const content = await createContent('', FILES)
      expect(content).toBe(FILE_LINKS)
    })
    it('text + files', async () => {
      const content = await createContent('test text', FILES)
      expect(content).toBe(`test text\n\n${FILE_LINKS}`)
    })
    it('link + files', async () => {
      const content = await createContent(LINK, FILES)
      expect(content).toBe(`${LINK}\n${FILE_LINKS}`)
    })
    it('text + link + files', async () => {
      const content = await createContent(`test text\n${LINK}`, FILES)
      expect(content).toBe(`test text\n${LINK}\n${FILE_LINKS}`)
    })
    it('line breaks + files', async () => {
      const content = await createContent(LINE_BREAKS, FILES)
      expect(content).toBe(`${LINE_BREAKS}\n${FILE_LINKS}`)
    })
    it('text + line breaks + files', async () => {
      const content = await createContent(`test text${LINE_BREAKS}`, FILES)
      expect(content).toBe(`test text${LINE_BREAKS}\n\n${FILE_LINKS}`)
    })
    it('link + line breaks + files', async () => {
      const content = await createContent(`${LINK}${LINE_BREAKS}`, FILES)
      expect(content).toBe(`${LINK}\n${FILE_LINKS}`)
    })
    it('text + link + line breaks + files', async () => {
      const content = await createContent(
        `test text\n${LINK}${LINE_BREAKS}`,
        FILES
      )
      expect(content).toBe(`test text\n${LINK}\n${FILE_LINKS}`)
    })
    it('bullet point link + files', async () => {
      const content = await createContent(`- ${LINK}`, FILES)
      expect(content).toBe(`- ${LINK}\n\n${FILE_LINKS}`)
    })
    it('bullet point link + line breaks + files', async () => {
      const content = await createContent(`- ${LINK}${LINE_BREAKS}`, FILES)
      expect(content).toBe(`- ${LINK}${LINE_BREAKS}\n\n${FILE_LINKS}`)
    })
  })
})
