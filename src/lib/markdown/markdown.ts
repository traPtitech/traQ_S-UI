import type { Store, traQMarkdownIt } from '@traptitech/traq-markdown-it'
import useChannelPath from '/@/composables/useChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useUsersStore } from '/@/store/entities/users'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'

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
    return `${embeddingOrigin}${channelIdToLink(id)}`
  },
  generateUserHref(id) {
    return `javascript:openUserModal(${JSON.stringify(id)})`
  },
  generateUserGroupHref(id) {
    return `javascript:openGroupModal(${JSON.stringify(id)})`
  }
}

let md: traQMarkdownIt
const loadMd = async () => {
  if (md) return
  const { traQMarkdownIt } = await import('./traq-markdown-it')
  md = new traQMarkdownIt(storeProvider, [], embeddingOrigin)
}

const waitForInitialFetch = async () => {
  const { usersMapInitialFetchPromise } = useUsersStore()
  const { userGroupsMapInitialFetchPromise } = useGroupsStore()
  const { bothChannelsMapInitialFetchPromise } = useChannelsStore()
  const { stampsMapInitialFetchPromise } = useStampsStore()

  await Promise.all([
    usersMapInitialFetchPromise,
    userGroupsMapInitialFetchPromise,
    bothChannelsMapInitialFetchPromise,
    stampsMapInitialFetchPromise,
    loadMd()
  ])
}

export const render = async (text: string) => {
  await waitForInitialFetch()
  return md.render(text)
}

export const renderInline = async (text: string) => {
  await waitForInitialFetch()
  return md.renderInline(text)
}

export const parse = async (text: string) => {
  await waitForInitialFetch()
  return md.md.parse(text, {})
}
