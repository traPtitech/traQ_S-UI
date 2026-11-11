import { readFile } from 'node:fs/promises'

import { vi } from 'vitest'

import {
  detectMentionOfMe,
  embedInternalLinks,
  render,
  renderCondensed,
  unembedInternalLinks
} from '/@/lib/markdown/markdown'

const id = '00000000-0000-0000-0000-000000000001'

vi.mock('/@/lib/markdown/runtime', async () => {
  const sdk = await import('@traq-flavored-markdown/sdk')
  const renderer = await import('@traq-flavored-markdown/sdk/renderer')
  const adapters = await import('@traq-flavored-markdown/sdk/adapters')
  const runtime = await sdk.createRuntime(
    await readFile('node_modules/@traq-flavored-markdown/sdk/dist/parser.wasm')
  )
  afterAll(() => runtime.dispose())
  return { ...sdk, ...renderer, ...adapters, loadRuntime: async () => runtime }
})
vi.mock('/@/composables/useChannelPath', () => ({
  default: () => ({ channelIdToLink: () => '/channels/general' })
}))
vi.mock('/@/lib/apis', () => ({
  embeddingOrigin: 'https://example.test',
  buildFilePath: (fileId: string) =>
    `https://example.test/api/v3/files/${fileId}`
}))
vi.mock('/@/store/domain/me', () => ({
  useMeStore: () => ({ detail: { value: { id } } })
}))
vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({
    bothChannelsMapInitialFetchPromise: Promise.resolve()
  })
}))
vi.mock('/@/store/entities/groups', () => ({
  useGroupsStore: () => ({
    userGroupsMapInitialFetchPromise: Promise.resolve(),
    userGroupsMap: {
      value: new Map([[id, { members: [{ id, role: 'member' }] }]])
    }
  })
}))
vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: () => ({
    stampsMapInitialFetchPromise: Promise.resolve(),
    getStampByName: () => ({ fileId: id })
  })
}))
vi.mock('/@/store/entities/users', () => ({
  useUsersStore: () => ({
    usersMapInitialFetchPromise: Promise.resolve(),
    findUserByName: () => ({ iconFileId: id })
  })
}))

it('renders math, highlighted code, stamps and reference links through the published SDK', async () => {
  const reference = `!${JSON.stringify({ type: 'group', id, raw: '@group' })}`
  const result = await render(
    `${reference}\n:traq:\n$\\frac{a}{b}$\n\n\`\`\`js\nconst x = 1\n\`\`\``
  )
  const container = document.createElement('div')
  container.innerHTML = result.renderedText
  expect(container.querySelector('p')?.getAttribute('dir')).toBe('auto')
  expect(
    container
      .querySelector('.message-group-link-highlight')
      ?.getAttribute('href')
  ).toBe(`https://example.test/groups/${id}`)
  expect(container.querySelector('.emoji')?.getAttribute('style')).toContain(
    `/api/v3/files/${id}`
  )
  expect(container.querySelector('.katex .mfrac')).not.toBeNull()
  expect(container.querySelector('.hljs-keyword')).not.toBeNull()
})

it('adapts resource cards for standard and condensed message views', async () => {
  const text = `hello\nhttps://example.test/files/${id}`
  const standard = await render(text)
  const condensed = await renderCondensed(text)
  expect(standard.embeddings).toEqual([{ type: 'file', id }])
  expect(condensed.embeddings).toEqual(standard.embeddings)
  expect(standard.renderedText).toContain('hello')
  expect(condensed.renderedText).toContain('hello')
})

it('embeds and restores references and detects mentions from the parsed document', async () => {
  const embedded = await embedInternalLinks('@someone', () => id)
  expect(embedded).toContain(id)
  expect(await unembedInternalLinks(embedded)).toBe('@someone')
  expect(await detectMentionOfMe(embedded, id, [])).toBe(true)
  expect(await detectMentionOfMe(`\`${embedded}\``, id, [])).toBe(false)
})
