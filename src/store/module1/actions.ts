import { createActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { module1 } from './index'

export const module1ActionContext = (context: any) =>
  moduleActionContext(context, module1)

export const actions = createActions({
  testAction(context, payload: { num: number }) {
    const { commit, rootGetters } = module1ActionContext(context)
    commit.decrement(payload.num)
  }
})
