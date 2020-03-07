import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { stampPicker } from './index'

export const stampPickerActionContext = (context: any) =>
  moduleActionContext(context, stampPicker)

export const actions = defineActions({})
