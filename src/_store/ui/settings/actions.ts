import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { settings } from './index'
import { ActionContext } from 'vuex'

export const modalActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, settings)

export const actions = defineActions({})
