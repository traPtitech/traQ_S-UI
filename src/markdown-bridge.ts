import type { UserId, UserGroupId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'
import { useUsersStore } from '/@/store/entities/users'
import { useGroupsStore } from '/@/store/entities/groups'

interface ExtendedWindow extends Window {
  /**
   * ユーザーモーダルを開く
   * レンダリングされたmarkdown本文に埋め込まれるリンク(`@user`)のクリック時に呼び出される
   * @param userId ユーザーID
   */
  openUserModal(userId: string): void

  /**
   * グループモーダルを開く
   * レンダリングされたmarkdown本文に埋め込まれるリンク(`@group`)のクリック時に呼び出される
   * @param userGroupId ユーザーグループID
   */
  openGroupModal(userGroupId: string): void
}
declare const window: ExtendedWindow

const checkUserExistence = async (userId: UserId) => {
  const { usersMap, fetchUser } = useUsersStore()

  if (usersMap.value.has(userId)) return true
  try {
    await fetchUser({ userId })
    return true
  } catch {
    return false
  }
}

const checkGroupExistence = (userGroupId: UserGroupId) => {
  const { userGroupsMap } = useGroupsStore()
  return userGroupsMap.value.has(userGroupId)
}

export const setupGlobalFuncs = () => {
  window.openUserModal = async (userId: UserId) => {
    if (!(await checkUserExistence(userId))) return

    const { usersMap } = useUsersStore()
    const user = usersMap.value.get(userId)
    if (user?.bot && user.name.startsWith('Webhook#')) return

    const { pushModal } = useModalStore()
    pushModal({
      type: 'user',
      id: userId
    })
  }

  window.openGroupModal = (userGroupId: UserGroupId) => {
    if (!checkGroupExistence(userGroupId)) return

    const { pushModal } = useModalStore()
    pushModal({
      type: 'group',
      id: userGroupId
    })
  }
}
