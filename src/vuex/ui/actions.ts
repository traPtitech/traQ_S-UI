import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/vuex'
import { ui } from './index'
import { ActionContext } from 'vuex'

export const appActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, ui)

export const actions = defineActions({})
