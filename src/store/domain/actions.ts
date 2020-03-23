import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import api from '@/lib/api'
import { domain } from './index'

export const domainActionContext = (context: any) =>
  moduleActionContext(context, domain)

export const actions = defineActions({
  async fetchChannelActivity(context) {
    const { commit } = domainActionContext(context)
    const result = await api.getActivityTimeline(50, true)
    commit.setChannelActivity(result.data)
  },
  async fetchOnlineUsers(context) {
    const { commit } = domainActionContext(context)
    const result = await api.getOnlineUsers()
    commit.setOnlineUsers(result.data)
  }
})
