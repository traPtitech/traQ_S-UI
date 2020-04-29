import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { browserSettings } from './index'
import { ActionContext } from 'vuex'

export const browserSettingsActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, browserSettings)

export const actions = defineActions({})
