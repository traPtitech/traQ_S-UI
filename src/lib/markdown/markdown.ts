import type { LookupKind, Parser, Processor } from '@traq-markdown-parser/traq'
import type { Options } from '@traq-markdown-parser/traq/renderer'
import type { messageRenderer } from '@traq-markdown-parser/traq/renderer'

import useChannelPath from '/@/composables/useChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

const storeProvider: NonNullable<Options['store']> = {
  getUserGroup(id) {
    const { userGroupsMap } = useGroupsStore()
    return userGroupsMap.value.get(id)
  },
  getMe() {
    const { detail } = useMeStore()
    return detail.value
  },
  getStampByName(name) {
    const { getStampByName } = useStampsStore()
    return getStampByName(name)
  },
  getUserByName(name) {
    const { findUserByName } = useUsersStore()
    return findUserByName(name)
  },
  generateChannelHref(id) {
    const { channelIdToLink } = useChannelPath()
    return `${embeddingOrigin}${channelIdToLink(id) as string}`
  },
  generateUserHref(id) {
    return `${embeddingOrigin}/users/${encodeURIComponent(id)}`
  },
  generateUserGroupHref(id) {
    return `${embeddingOrigin}/groups/${encodeURIComponent(id)}`
  }
}

let parser: Parser
let processor: Processor
let renderer: ReturnType<typeof messageRenderer>
let loading: Promise<void> | undefined
const loadMarkdown = () =>
  (loading ??= (async () => {
    const { createRuntime, presets, messageRenderer, wasmUrl } =
      await import('./runtime')

    const response = await fetch(wasmUrl)
    if (!response.ok) throw new Error('Failed to load Markdown parser')

    const runtime = await createRuntime(
      new Uint8Array(await response.arrayBuffer())
    )

    parser = runtime.createParser(presets.traq.v1)
    processor = runtime.createProcessor(presets.traq.v1, {
      origin: embeddingOrigin
    })
    renderer = messageRenderer({
      store: storeProvider,
      origin: embeddingOrigin
    })
  })().catch(error => {
    loading = undefined
    throw error
  }))

const waitForMarkdownReady = () => {
  const { usersMapInitialFetchPromise } = useUsersStore()
  const { userGroupsMapInitialFetchPromise } = useGroupsStore()
  const { bothChannelsMapInitialFetchPromise } = useChannelsStore()
  const { stampsMapInitialFetchPromise } = useStampsStore()

  return Promise.all([
    usersMapInitialFetchPromise,
    userGroupsMapInitialFetchPromise,
    bothChannelsMapInitialFetchPromise,
    stampsMapInitialFetchPromise,
    loadMarkdown()
  ])
}

export const parse = async (text: string) => {
  await waitForMarkdownReady()

  return parser.parse(text)
}

export const render = async (text: string) => renderer.render(await parse(text))

export const renderInline = async (text: string) =>
  renderer.renderInline(await parse(text))

export const endsWithEmbeddedLink = async (text: string) => {
  await waitForMarkdownReady()

  const { endsWithEmbedding } = await import('./runtime')

  return endsWithEmbedding(parser.parse(text), embeddingOrigin)
}

const processMarkdown = async (text: string) => {
  await loadMarkdown()

  return processor.process(text)
}

export const embedInternalLinks = async (
  text: string,
  resolve: (kind: LookupKind, name: string) => string | undefined
) => {
  const result = await processMarkdown(text)
  const { embedReferences } = await import('./runtime')

  return embedReferences(text, result.embedding, resolve)
}

export const unembedInternalLinks = async (text: string) => {
  const result = await processMarkdown(text)

  return result.embedding.unembeddedText
}

export const detectMentionOfMe = async (
  text: string,
  userId: string,
  groupIds: readonly string[]
) => {
  const result = await processMarkdown(text)
  const { mentionsUser } = await import('./runtime')

  return mentionsUser(result.references, userId, groupIds)
}
