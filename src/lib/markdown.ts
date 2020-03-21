import MarkdownIt, { Store } from '@traptitech/traq-markdown-it'
import store from '@/store'

// TODO:
interface Group {
  members: string[]
}
interface Stamp {
  name: string
  fileId: string
}

const storeProvider: Store = {
  getUser(id) {
    return store.state.entities.users[id]
  },
  getChannel(id) {
    return store.state.entities.channels[id]
  },
  getChannelPath(id) {
    // let current = this.getChannel(id)
    // let path = current?.name
    // let next = this.getChannel(current.parent)
    // while (next.name) {
    //   path = next.name + '/' + path
    //   current = next
    //   next = this.getChannel(current.parent)
    // }
    return ''
  },
  getUserGroup(id) {
    return store.state.entities.userGroups[id]
  },
  getMe() {
    return store.state.domain.me
  },
  getStampByName(name) {
    return store.getters.entities.getStampByName(name)
  },
  getUserByName(name) {
    return {
      iconFileId: store.getters.entities.getUserByName(name)?.iconFileId ?? ''
    }
  }
}

const md = new MarkdownIt(storeProvider)

export const render = (text: string) => {
  return md.render(text)
}
