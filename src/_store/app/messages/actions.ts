import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { messages } from './index'
import { ActionContext } from 'vuex'

export const messagesActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, messages)

export const actions = defineActions({})
