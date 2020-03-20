import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { messages } from './index'

export const messagesActionContext = (context: any) =>
  moduleActionContext(context, messages)

export const actions = defineActions({})
