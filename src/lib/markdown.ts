import MarkdownIt, { Store } from '@traptitech/traq-markdown-it'
import store from '@/store'

const storeProvider: Store = {
  getUser(id) {
    return store.state.entities.users[id]
  },
  getChannel(id) {
    return store.state.entities.channels[id]
  },
  getChannelPath(id) {
    let current = this.getChannel(id)
    if (!current) return ''

    let path = current.name
    let next = this.getChannel(current.parentId ?? '')
    if (!next) return path

    while (next) {
      path = next.name + '/' + path
      current = next
      next = this.getChannel(current.parentId ?? '')
    }
    return path
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
