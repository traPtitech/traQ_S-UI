import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { me } from './index'

export const meActionContext = (context: any) =>
  moduleActionContext(context, me)

export const actions = defineActions({})
