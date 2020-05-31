import { Store } from '@traptitech/traq-markdown-it'
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import { embeddingOrigin } from './apis'

const { channelIdToPathString } = useChannelPath()

const storeProvider: Store = {
  getUser(id) {
    return store.state.entities.users[id]
  },
  getChannel(id) {
    return store.state.entities.channels[id]
  },
  getChannelPath(id) {
    return channelIdToPathString(id)
  },
  getUserGroup(id) {
    return store.state.entities.userGroups[id]
  },
  getMe() {
    return store.state.entities.users[store.state.domain.me.detail?.id ?? '']
  },
  getStampByName(name) {
    return store.getters.entities.stampByName(name)
  },
  getUserByName(name) {
    return store.getters.entities.userByName(name)
  }
}

const md = (async () => {
  const MarkdownIt = (await import('@traptitech/traq-markdown-it')).default
  return new MarkdownIt(storeProvider, [], embeddingOrigin)
})()

export const render = async (text: string) => {
  return (await md).render(text)
}

export const renderInline = async (text: string) => {
  return (await md).renderInline(text)
}

export const parse = (text: string) => {
  return md.md.parse(text, {})
}

export const toggleSpoiler = (element: HTMLElement) => {
  const $spoiler = element.closest('.spoiler')
  $spoiler?.toggleAttribute('shown')
}
