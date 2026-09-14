import { vi } from 'vitest'

import {
  embedInternalLinks,
  endsWithEmbeddedLink,
  render,
  renderCondensed,
  unembedInternalLinks
} from '/@/lib/markdown/markdown'

vi.mock('/@/composables/useChannelPath', () => ({
  default: () => ({ channelIdToLink: () => '' })
}))

vi.mock('/@/lib/apis', () => ({
  embeddingOrigin: 'https://example.test'
}))

vi.mock('/@/lib/markdown/runtime', () => ({
  loadRuntime: async () => ({
    createParser: () => ({
      parse: () => {
        throw new Error('parser failed')
      }
    }),
    createExtractor: () => ({ extract: vi.fn() })
  }),
  presets: { traq: { v1: {} } },
  messageRenderers: () => ({
    standard: { render: vi.fn() },
    condensed: { render: vi.fn() }
  })
}))

vi.mock('/@/store/domain/me', () => ({
  useMeStore: () => ({ detail: { value: undefined } })
}))

vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({
    bothChannelsMapInitialFetchPromise: Promise.resolve()
  })
}))

vi.mock('/@/store/entities/groups', () => ({
  useGroupsStore: () => ({
    userGroupsMapInitialFetchPromise: Promise.resolve()
  })
}))

vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: () => ({ stampsMapInitialFetchPromise: Promise.resolve() })
}))

vi.mock('/@/store/entities/users', () => ({
  useUsersStore: () => ({ usersMapInitialFetchPromise: Promise.resolve() })
}))

describe('Markdown fallback', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders escaped original text when parsing fails', async () => {
    const text = '<script>alert("x")</script>\n&'
    const expected = {
      rawText: text,
      renderedText:
        '&#60;script&#62;alert(&#34;x&#34;)&#60;/script&#62;<br>&#38;',
      embeddings: []
    }

    await expect(render(text)).resolves.toEqual(expected)
    await expect(renderCondensed(text)).resolves.toEqual(expected)
  })

  it('keeps original text available to message actions when parsing fails', async () => {
    const text = 'raw message'

    await expect(endsWithEmbeddedLink(text)).resolves.toBe(false)
    await expect(embedInternalLinks(text, () => 'id')).resolves.toBe(text)
    await expect(unembedInternalLinks(text)).resolves.toBe(text)
  })
})
