import type {
  Extractor,
  Parser,
  ReferenceKind
} from '@traq-flavored-markdown/sdk'
import type { messageRenderers } from '@traq-flavored-markdown/sdk/renderer'

import { embeddingOrigin } from '/@/lib/apis'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import { presentation } from './presentation'
import type { MarkdownRenderResult } from './types'

let parser: Parser
let extractor: Extractor
let renderers: ReturnType<typeof messageRenderers>
let loading: Promise<void> | undefined

const toRenderResult = (
  result: ReturnType<ReturnType<typeof messageRenderers>['standard']['render']>
): MarkdownRenderResult => ({
  rawText: result.rawText,
  embeddings: result.cards,
  renderedText: result.html.replace(
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
    const { loadRuntime, presets, messageRenderers, withDefaultAdapters } =
      await import('./runtime')

    const runtime = await loadRuntime()

    parser = runtime.createParser(presets.traq.v1)
    extractor = runtime.createExtractor({
      origin: embeddingOrigin
    })
    renderers = messageRenderers({
      ...withDefaultAdapters(presentation),
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
    return toRenderResult(renderers.standard.render(document))
  })

export const renderCondensed = (text: string) =>
  withFallback(fallbackRender(text), async () => {
    const document = await parse(text)
    return toRenderResult(renderers.condensed.render(document))
  })

export const renderInline = renderCondensed

export const endsWithEmbeddedLink = (text: string) =>
  withFallback(false, async () => {
    await waitForMarkdownReady()

    const { endsWithResourceCard } = await import('./runtime')

    return endsWithResourceCard(parser.parse(text), embeddingOrigin)
  })

const extractMarkdown = async (text: string) => {
  await loadMarkdown()

  return extractor.extract(parser.parse(text))
}

export const embedInternalLinks = (
  text: string,
  resolve: (kind: ReferenceKind, name: string) => string | undefined
) =>
  withFallback(text, async () => {
    const result = await extractMarkdown(text)
    const { embedReferences } = await import('./runtime')

    return embedReferences(text, result.referenceEmbedding, resolve)
  })

export const unembedInternalLinks = (text: string) =>
  withFallback(text, async () => {
    const result = await extractMarkdown(text)

    return result.referenceEmbedding.unembeddedText
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
