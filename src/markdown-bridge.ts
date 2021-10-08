import store from '/@/store'
import { UserId, UserGroupId } from '/@/types/entity-ids'

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
  if (store.state.entities.usersMap.has(userId)) return true
  try {
    await store.dispatch.entities.fetchUser({ userId })
    return true
  } catch {
    return false
  }
}

const checkGroupExistence = (userGroupId: UserGroupId) => {
  return store.state.entities.userGroupsMap.has(userGroupId)
}

export const setupGlobalFuncs = () => {
  window.openUserModal = async (userId: UserId) => {
    if (!(await checkUserExistence(userId))) return

    const user = store.state.entities.usersMap.get(userId)
    if (user?.bot && user.name.startsWith('Webhook#')) return

    store.dispatch.ui.modal.pushModal({
      type: 'user',
      id: userId
    })
  }

  window.openGroupModal = (userGroupId: UserGroupId) => {
    if (!checkGroupExistence(userGroupId)) return
    store.dispatch.ui.modal.pushModal({
      type: 'group',
      id: userGroupId
    })
  }
}
