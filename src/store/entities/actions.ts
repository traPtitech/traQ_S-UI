import { createActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { entities } from './index'

export const entitiesActionContext = (context: any) =>
  moduleActionContext(context, entities)

export const actions = createActions({
  // サーバーからentityを拾うなどの処理
})
