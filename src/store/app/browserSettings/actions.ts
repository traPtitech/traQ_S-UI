import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { browserSettings } from './index'

export const browserSettingsActionContext = (context: any) =>
  moduleActionContext(context, browserSettings)

export const actions = defineActions({})
