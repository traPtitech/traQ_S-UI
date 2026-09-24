import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'
import { useModalStore } from '/@/store/ui/modal'
import type { UserGroupId, UserId } from '/@/types/entity-ids'

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
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    const link = event.target.closest<HTMLAnchorElement>(
      'a.message-user-link, a.message-group-link'
    )
    if (!link) return
    const url = new URL(link.href)
    const match = /^\/(users|groups)\/([0-9a-f-]{36})$/.exec(url.pathname)
    if (!match?.[2]) return
    event.preventDefault()
    if (match[1] === 'users') window.openUserModal(match[2])
    else window.openGroupModal(match[2])
  })
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
