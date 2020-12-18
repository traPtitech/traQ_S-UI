import { Store } from '@traptitech/traq-markdown-it'
import store from '@/store'
import _store from '@/_store'
import useChannelPath from '@/use/channelPath'
import { embeddingOrigin } from './apis'
import {
  usersMapInitialFetchPromise,
  userGroupsMapInitialFetchPromise,
  bothChannelsMapInitialFetchPromise
} from '@/store/entities/promises'

const { channelIdToPathString } = useChannelPath()

const storeProvider: Store = {
  getUser(id) {
    return store.state.entities.usersMap.get(id)
  },
  getChannel(id) {
    return store.state.entities.channelsMap.get(id)
  },
  getChannelPath(id) {
    return channelIdToPathString(id)
  },
  getUserGroup(id) {
    return store.state.entities.userGroupsMap.get(id)
  },
  getMe() {
    return _store.state.domain.me.detail
  },
  getStampByName(name) {
    return store.getters.entities.stampByName(name)
  },
  getUserByName(name) {
    return store.getters.entities.userByName(name)
  }
}

const md = (async () => {
  const { traQMarkdownIt } = await import('./traq-markdown-it')
  return new traQMarkdownIt(storeProvider, [], embeddingOrigin)
})()

const initialFetchPromise = Promise.all([
  usersMapInitialFetchPromise,
  userGroupsMapInitialFetchPromise,
  bothChannelsMapInitialFetchPromise
])

export const render = async (text: string) => {
  await initialFetchPromise
  return (await md).render(text)
}

export const renderInline = async (text: string) => {
  await initialFetchPromise
  return (await md).renderInline(text)
}

export const parse = async (text: string) => {
  await initialFetchPromise
  return (await md).md.parse(text, {})
}

export const toggleSpoiler = (element: HTMLElement) => {
  const $spoiler = element.closest('.spoiler')
  $spoiler?.toggleAttribute('shown')
}
