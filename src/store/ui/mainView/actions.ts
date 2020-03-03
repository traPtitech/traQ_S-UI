import { createActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { mainView } from './index'

export const mainViewActionContext = (context: any) =>
  moduleActionContext(context, mainView)

export const actions = createActions({})
