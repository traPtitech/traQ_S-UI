import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { domain } from './index'

export const domainActionContext = (context: any) =>
  moduleActionContext(context, domain)

export const actions = defineActions({})
