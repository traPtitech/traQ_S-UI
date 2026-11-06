import { renderStampInline } from '/@/lib/markdown/compatibility/stampRenderer'
import { createMarkdownRenderer } from '/@/lib/markdown/parser'
import { createMarkdownAnalysisParser } from '/@/lib/markdown/syntax'

vi.mock('/@/lib/markdown/store', () => ({
  markdownStore: {
    getUser: () => undefined,
    getChannel: (id: string) => ({ id }),
    getUserGroup: () => undefined,
    getMe: () => undefined,
    getStampByName: (name: string) => ({ name, fileId: 'stamp-id' }),
    getUserByName: () => ({ iconFileId: 'icon-id' }),
    generateChannelHref: (id: string) => `/channels/${id}`,
    generateUserHref: (id: string) => `/users/${id}`,
    generateUserGroupHref: (id: string) => `/groups/${id}`
  }
}))

it.each(['analysis-first', 'renderer-first'])(
  'keeps syntax stores independent with %s initialization',
  order => {
    if (order === 'analysis-first') createMarkdownAnalysisParser()

    const renderer = createMarkdownRenderer()
    const source =
      ':test.large: :@alice: !{"type":"channel","id":"channel","raw":"#general"}'
    const before = renderer.renderInline(source)
    const syntax = createMarkdownAnalysisParser().parse(source, {})
    const again = createMarkdownAnalysisParser().parse(source, {})

    expect(again).toEqual(syntax)
    expect(renderer.renderInline(source)).toEqual(before)
    expect(before.renderedText).toContain('/channels/channel')

    for (const stamp of [
      ':test.large:',
      ':@alice:',
      ':0xffaabb:',
      ':hsl(120, 50%, 40%).wiggle:'
    ]) {
      expect(renderStampInline(stamp)).toBe(
        renderer.renderInline(stamp).renderedText
      )
      createMarkdownAnalysisParser()
      expect(renderStampInline(stamp)).toBe(
        renderer.renderInline(stamp).renderedText
      )
    }
  }
)
