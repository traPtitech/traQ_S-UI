import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineWsListeners } from './listeners'
import mitt from 'mitt'
import { Message } from '@traptitech/traq'
import { MessageId } from '/@/types/entity-ids'

export const messages = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
defineWsListeners(store => store.entities.messages)

type MessageEventMap = {
  reconnect: void
  addMessage: { message: Message; isCiting: boolean }
  updateMessage: Message
  deleteMessage: MessageId
  changeMessagePinned: { message: Message; pinned: boolean }
}

export const messageMitt = mitt<MessageEventMap>()
