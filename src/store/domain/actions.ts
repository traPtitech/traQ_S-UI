import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import apis from '@/lib/apis'
import { domain, ACTIVITY_LENGTH } from '.'
import { UserId } from '@/types/entity-ids'
import { ActionContext } from 'vuex'

export const domainActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, domain)

export const actions = defineActions({
  async fetchActivityTimeline(
    context,
    options: { all?: boolean; perChannel?: boolean }
  ) {
    const { commit } = domainActionContext(context)
    const result = await apis.getActivityTimeline(
      ACTIVITY_LENGTH,
      options.all,
      options.perChannel
    )
    commit.setActivityTimeline(result.data)
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
