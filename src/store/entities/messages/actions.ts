import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messages } from '.'
import { ActionContext } from 'vuex'

export const messagesActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, messages)

export const actions = defineActions({})
