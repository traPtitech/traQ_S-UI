import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { themeSettings } from './index'

export const themeSettingsActionContext = (context: any) =>
  moduleActionContext(context, themeSettings)

export const actions = defineActions({})
