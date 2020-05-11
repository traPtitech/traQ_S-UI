import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { toast } from './index'
import { ActionContext } from 'vuex'

export const toastActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, toast)

export const actions = defineActions({})
