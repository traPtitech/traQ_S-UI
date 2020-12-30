import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { app } from './index'
import { ActionContext } from 'vuex'

export const appActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, app)

export const actions = defineActions({})
