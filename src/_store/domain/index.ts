import { defineModule } from 'direct-vuex'
import { me } from './me'

export const domain = defineModule({
  namespaced: true,
  modules: {
    me
  }
})
