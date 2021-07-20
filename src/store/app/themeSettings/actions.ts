import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { themeSettings } from '.'
import { ActionContext } from 'vuex'

export const themeSettingsActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, themeSettings)

export const actions = defineActions({})
