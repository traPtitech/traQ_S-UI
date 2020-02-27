import { createActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { ui } from './index'

export const appActionContext = (context: any) =>
  moduleActionContext(context, ui)

export const actions = createActions({})
