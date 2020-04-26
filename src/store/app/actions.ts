import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { app } from './index'
import apis from '@/lib/apis'

export const appActionContext = (context: any) =>
  moduleActionContext(context, app)

export const actions = defineActions({
  async fetchVersionInfo(context) {
    const { commit } = appActionContext(context)
    const res = await apis.getServerVersion()
    commit.setVersion(res.data)
  }
})
