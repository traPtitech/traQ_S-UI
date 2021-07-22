import type { Store, traQMarkdownIt } from '@traptitech/traq-markdown-it'
import store from '/@/store'
import useChannelPath from '/@/use/channelPath'
import { embeddingOrigin } from '../apis'
import {
  usersMapInitialFetchPromise,
  userGroupsMapInitialFetchPromise,
  bothChannelsMapInitialFetchPromise,
  stampsMapInitialFetchPromise
} from '/@/store/entities/promises'

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
    return store.state.domain.me.detail
  },
  getStampByName(name) {
    return store.getters.entities.stampByName(name)
  },
  getUserByName(name) {
    return store.getters.entities.userByName(name)
  }
}

let md: traQMarkdownIt
const loadMd = async () => {
  if (md) return
  const { traQMarkdownIt } = await import('./traq-markdown-it')
  md = new traQMarkdownIt(storeProvider, [], embeddingOrigin)
}

const initialFetchPromise = Promise.all([
  usersMapInitialFetchPromise,
  userGroupsMapInitialFetchPromise,
  bothChannelsMapInitialFetchPromise,
  stampsMapInitialFetchPromise
]).then(() => loadMd())

export const render = async (text: string) => {
  await initialFetchPromise
  return md.render(text)
}

export const renderInline = async (text: string) => {
  await initialFetchPromise
  return md.renderInline(text)
}

export const parse = async (text: string) => {
  await initialFetchPromise
  return md.md.parse(text, {})
}
