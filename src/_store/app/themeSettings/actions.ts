import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { themeSettings } from './index'
import { ActionContext } from 'vuex'

export const themeSettingsActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, themeSettings)

export const actions = defineActions({})
