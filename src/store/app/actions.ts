import { createActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { app } from './index'

export const appActionContext = (context: any) =>
  moduleActionContext(context, app)

export const actions = createActions({})
