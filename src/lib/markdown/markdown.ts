import type { Extractor, LookupKind, Parser } from '@traq-flavored-markdown/sdk'
import type { Options } from '@traq-flavored-markdown/sdk/renderer'
import type { messageRenderers } from '@traq-flavored-markdown/sdk/renderer'

import useChannelPath from '/@/composables/useChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import type { MarkdownRenderResult } from './types'

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
let extractor: Extractor
let renderers: ReturnType<typeof messageRenderers>
let loading: Promise<void> | undefined

const withAutoDirection = <T extends { renderedText: string }>(
  result: T
): T => ({
  ...result,
  renderedText: result.renderedText.replace(
    /<(p|h[1-6]|li|th|td)(?=[\s>])/g,
    '<$1 dir="auto"'
  )
})

const fallbackRender = (text: string): MarkdownRenderResult => ({
  rawText: text,
  renderedText: text
    .replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`)
    .replace(/\r?\n/g, '<br>'),
  embeddings: []
})

const withFallback = async <T>(
  fallback: T,
  action: () => Promise<T>
): Promise<T> => {
  try {
    return await action()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Markdown の処理に失敗しました', error)
    return fallback
  }
}

const loadMarkdown = () =>
  (loading ??= (async () => {
    const { loadRuntime, presets, messageRenderers } = await import('./runtime')

    const runtime = await loadRuntime()

    parser = runtime.createParser(presets.traq.v1)
    extractor = runtime.createExtractor({
      origin: embeddingOrigin
    })
    renderers = messageRenderers({
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

export const render = (text: string) =>
  withFallback(fallbackRender(text), async () => {
    const document = await parse(text)
    return withAutoDirection(renderers.standard.render(document))
  })

export const renderCondensed = (text: string) =>
  withFallback(fallbackRender(text), async () => {
    const document = await parse(text)
    return withAutoDirection(renderers.condensed.render(document))
  })

export const endsWithEmbeddedLink = (text: string) =>
  withFallback(false, async () => {
    await waitForMarkdownReady()

    const { endsWithEmbedding } = await import('./runtime')

    return endsWithEmbedding(parser.parse(text), embeddingOrigin)
  })

const extractMarkdown = async (text: string) => {
  await loadMarkdown()

  return extractor.extract(parser.parse(text))
}

export const embedInternalLinks = (
  text: string,
  resolve: (kind: LookupKind, name: string) => string | undefined
) =>
  withFallback(text, async () => {
    const result = await extractMarkdown(text)
    const { embedReferences } = await import('./runtime')

    return embedReferences(text, result.embedding, resolve)
  })

export const unembedInternalLinks = (text: string) =>
  withFallback(text, async () => {
    const result = await extractMarkdown(text)

    return result.embedding.unembeddedText
  })

export const detectMentionOfMe = async (
  text: string,
  userId: string,
  groupIds: readonly string[]
) => {
  const result = await extractMarkdown(text)
  const { mentionsUser } = await import('./runtime')

  return mentionsUser(result.references, userId, groupIds)
}
