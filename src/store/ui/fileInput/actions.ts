import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { fileInput } from './index'

export const fileInputActionContext = (context: any) =>
  moduleActionContext(context, fileInput)

export const actions = defineActions({})
