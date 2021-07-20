import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { app } from '.'
import { ActionContext } from 'vuex'

export const appActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, app)

export const actions = defineActions({})
