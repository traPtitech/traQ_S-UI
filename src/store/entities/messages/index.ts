import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineWsListeners } from './listeners'
import { mitt } from '/@/lib/typedMitt'
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
  reconnect: () => void
  addMessage: (payload: { message: Message; isCiting: boolean }) => void
  updateMessage: (message: Message) => void
  deleteMessage: (messageId: MessageId) => void
  changeMessagePinned: (payload: { message: Message; pinned: boolean }) => void
}

export const messageMitt = mitt<MessageEventMap>()
