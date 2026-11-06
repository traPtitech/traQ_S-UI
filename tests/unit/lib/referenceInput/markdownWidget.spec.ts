import { renderInlineWithCurrentEntities } from '/@/lib/markdown/parser'
import { markdownFormats } from '/@/lib/referenceInput/markdown'
import { renderMarkdownWidget } from '/@/lib/referenceInput/markdownWidget'

vi.mock('/@/store/entities/users', () => ({
  useUsersStore: () => ({ usersMapInitialFetchPromise: Promise.resolve() })
}))
vi.mock('/@/store/entities/groups', () => ({
  useGroupsStore: () => ({
    userGroupsMapInitialFetchPromise: Promise.resolve()
  })
}))
vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({
    bothChannelsMapInitialFetchPromise: Promise.resolve()
  })
}))
vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: () => ({ stampsMapInitialFetchPromise: Promise.resolve() })
}))

afterEach(() => document.body.replaceChildren())

describe('Markdown image widgets with the message renderer', () => {
  const render = (source: string) => {
    const image = markdownFormats(source).find(
      format => format.kind === 'rendered-inline'
    )
    expect(image).toBeDefined()
    if (!image || image.kind !== 'rendered-inline') throw new Error('No image')

    const widget = renderMarkdownWidget(image)
    document.body.append(widget)
    return widget
  }

  it.each([
    '![x][ref]\n\n[ref]: https://example.com/image.png',
    '![x][]\n\n[x]: https://example.com/image.png',
    '![x]\n\n[x]: https://example.com/image.png'
  ])('renders %s with its document definitions', async source => {
    const widget = render(source)

    await vi.waitFor(() => {
      expect(
        widget.querySelector('[data-is-image]')?.getAttribute('href')
      ).toBe('https://example.com/image.png')
    })
  })

  it('uses the updated reference definition', async () => {
    const first = render('![x][ref]\n\n[ref]: https://example.com/first.png')
    const next = render('![x][ref]\n\n[ref]: https://example.com/next.png')

    await vi.waitFor(() => {
      expect(first.querySelector('a')?.href).toBe(
        'https://example.com/first.png'
      )
      expect(next.innerHTML).toContain('href="https://example.com/next.png"')
    })
  })

  it('preserves the ordinary image policy', async () => {
    const source = '![x](https://example.com/image.png)'
    const widget = render(source)
    await vi.waitFor(() =>
      expect(widget.innerHTML).toBe(
        renderInlineWithCurrentEntities(source).renderedText
      )
    )
    expect(widget.querySelector('img')).toBeNull()
  })

  it('preserves the renderer image policy', () => {
    const source = '![x](javascript:alert(1))'
    expect(
      markdownFormats(source).some(format => format.kind === 'rendered-inline')
    ).toBe(false)
    expect(renderInlineWithCurrentEntities(source).renderedText).not.toContain(
      '<img'
    )
  })
})
