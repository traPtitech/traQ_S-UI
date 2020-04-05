import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtcSettings } from './index'

export const rtcSettingsActionContext = (context: any) =>
  moduleActionContext(context, rtcSettings)

export const actions = defineActions({})
