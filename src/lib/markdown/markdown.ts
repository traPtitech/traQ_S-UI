import type { Store, traQMarkdownIt } from '@traptitech/traq-markdown-it'

import useChannelPath from '/@/composables/useChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import { isDefined } from '../basic/array'

const storeProvider: Store = {
  getUser(id) {
    const { usersMap } = useUsersStore()
    return usersMap.value.get(id)
  },
  getChannel(id) {
    const { channelsMap } = useChannelsStore()
    return channelsMap.value.get(id)
  },
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
    return `javascript:openUserModal(${encodeURIComponent(JSON.stringify(id))})`
  },
  generateUserGroupHref(id) {
    return `javascript:openGroupModal(${encodeURIComponent(
      JSON.stringify(id)
    )})`
  }
}

let md: traQMarkdownIt
let initialization: Promise<void> | undefined
let isReady = false

const autoDirectionTokenTypes = new Set([
  'paragraph_open',
  'heading_open',
  'list_item_open',
  'th_open',
  'td_open'
])

const loadMd = async () => {
  if (md) return
  const { traQMarkdownIt } = await import('./traq-markdown-it')
  md = new traQMarkdownIt(storeProvider, [], embeddingOrigin)
  md.md.core.ruler.after('inline', 'bidi-auto-direction', state => {
    for (const token of state.tokens) {
      if (autoDirectionTokenTypes.has(token.type)) {
        token.attrSet('dir', 'auto')
      }
    }
  })
}

const prepareMarkdown = () => {
  if (initialization) return initialization

  const { usersMapInitialFetchPromise } = useUsersStore()
  const { userGroupsMapInitialFetchPromise } = useGroupsStore()
  const { bothChannelsMapInitialFetchPromise } = useChannelsStore()
  const { stampsMapInitialFetchPromise } = useStampsStore()

  initialization = Promise.all([
    usersMapInitialFetchPromise,
    userGroupsMapInitialFetchPromise,
    bothChannelsMapInitialFetchPromise,
    stampsMapInitialFetchPromise,
    loadMd()
  ]).then(
    () => {
      isReady = true
    },
    (error: unknown) => {
      initialization = undefined
      throw error
    }
  )

  return initialization
}

export const render = async (text: string) => {
  await prepareMarkdown()
  return md.render(text)
}

export const renderInlineIfReady = (text: string) =>
  isReady ? md.renderInline(text) : undefined

export const renderInline = async (text: string) => {
  await prepareMarkdown()
  return md.renderInline(text)
}

export const parse = async (text: string) => {
  await prepareMarkdown()
  return md.md.parse(text, {})
}

export const isEmbeddedLink = async (text: string) => {
  await prepareMarkdown()
  return isDefined(md.embeddingExtractor.urlToEmbeddingData(text))
}
