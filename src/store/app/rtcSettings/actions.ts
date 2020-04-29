import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtcSettings } from './index'
import { ActionContext } from 'vuex'

export const rtcSettingsActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, rtcSettings)

export const actions = defineActions({})
