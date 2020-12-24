import { defineModule } from 'direct-vuex'
import { me } from './me'
import { messagesView } from './messagesView'
import { stampCategory } from './stampCategory'

export const domain = defineModule({
  namespaced: true,
  modules: {
    me,
    messagesView,
    stampCategory
  }
})
