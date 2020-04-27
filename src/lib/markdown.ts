import MarkdownIt, { Store } from '@traptitech/traq-markdown-it'
import store from '@/store'
import useChannelPath from '@/use/channelPath'

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

const md = new MarkdownIt(storeProvider)

export const render = (text: string) => {
  return md.render(text)
}

export const renderInline = (text: string) => {
  return md.renderInline(text)
}

export const toggleSpoiler = (element: HTMLElement) => {
  const $spoiler = element.closest('.spoiler')
  $spoiler?.toggleAttribute('shown')
}
