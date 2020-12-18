import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { app } from './index'
import apis from '@/lib/apis'
import { ActionContext } from 'vuex'

export const appActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, app)

export const actions = defineActions({
  async fetchVersionInfo(context) {
    const { commit } = appActionContext(context)
    const res = await apis.getServerVersion()
    commit.setVersion(res.data)
  }
})
