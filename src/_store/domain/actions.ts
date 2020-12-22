import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import apis from '@/lib/apis'
import { domain } from '.'
import { UserId } from '@/types/entity-ids'
import { ActionContext } from 'vuex'

export const domainActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, domain)

export const actions = defineActions({
  async fetchUserDetail(context, userId: UserId) {
    const { commit } = domainActionContext(context)
    const result = await apis.getUser(userId)
    commit.setUserDetail(result.data)
  }
})
