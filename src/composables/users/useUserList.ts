import { UserAccountState } from '@traptitech/traq'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { compareStringInsensitive } from '/@/lib/basic/string'
import { isWebhook } from '/@/lib/user'
import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

/**
 * 'inactive': 凍結されているユーザー
 * 'bot': bot (Webhookも含まれる)
 * 'webhook': webhook
 * UserId: 特定のIDのユーザー (例えば、自分のIDを指定する)
 */
type Exclude = Array<'inactive' | 'bot' | 'webhook' | UserId>

const useUserList = (exclude: Ref<Exclude> | Exclude = ['inactive']) => {
  const { usersMap } = useUsersStore()

  const rawUserList = computed(() =>
    [...usersMap.value.values()].sort((u1, u2) =>
      compareStringInsensitive(u1.name, u2.name)
    )
  )
  const filteredUserList = computed(() => {
    const ex = new Set(unref(exclude))
    return rawUserList.value.filter(
      user =>
        (!ex.has('inactive') || user.state === UserAccountState.active) &&
        (!ex.has('bot') || !user.bot) &&
        (!ex.has('webhook') || !isWebhook(user.name)) &&
        !ex.has(user.id)
    )
  })

  return filteredUserList
}

export default useUserList
