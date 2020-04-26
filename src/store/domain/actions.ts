import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import apis from '@/lib/apis'
import { domain } from './index'
import { UserId } from '@/types/entity-ids'

export const domainActionContext = (context: any) =>
  moduleActionContext(context, domain)

export const actions = defineActions({
  async fetchChannelActivity(context) {
    const { commit } = domainActionContext(context)
    const result = await apis.getActivityTimeline(50, true)
    commit.setChannelActivity(result.data)
  },
  async fetchOnlineUsers(context) {
    const { commit } = domainActionContext(context)
    const result = await apis.getOnlineUsers()
    commit.setOnlineUsers(result.data)
  },
  async fetchUserDetail(context, userId: UserId) {
    const { commit } = domainActionContext(context)
    const result = await apis.getUser(userId)
    commit.setUserDetail(result.data)
  }
})
