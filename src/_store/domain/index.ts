import { defineModule } from 'direct-vuex'
import { me } from './me'
import { channelTree } from './channelTree'
import { messagesView } from './messagesView'
import { stampCategory } from './stampCategory'

export const domain = defineModule({
  namespaced: true,
  modules: {
    me,
    channelTree,
    messagesView,
    stampCategory
  }
})
