import type { Parser } from '@traq-markdown-parser/traq'
import type { Options } from '@traq-markdown-parser/traq/renderer/v1'
import type { messageRenderer } from '@traq-markdown-parser/traq/renderer/v1'

import useChannelPath from '/@/composables/useChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import { isDefined } from '../basic/array'

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

export const isEmbeddedLink = async (text: string) => {
  await waitForMarkdownReady()

  const { embeddingFromUrl } = await import('./runtime')

  return isDefined(embeddingFromUrl(text, embeddingOrigin))
}
