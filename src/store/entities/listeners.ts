import { defineListeners } from '../utils/defineListeners'

defineListeners('entities', (listener, { dispatch }) => {
  listener.on('USER_JOINED', ({ id }) => {
    dispatch.fetchUser({ userId: id })
  })
  listener.on('USER_UPDATED', ({ id }) => {
    dispatch.fetchUser({ userId: id })
  })
  listener.on('USER_LEFT', ({ id }) => {
    dispatch.deleteUser(id)
  })
  listener.on('USER_ICON_UPDATED', ({ id }) => {
    dispatch.fetchUser({ userId: id })
  })

  listener.on('USER_GROUP_CREATED', ({ id }) => {
    dispatch.fetchUserGroup({ userGroupId: id })
  })
  listener.on('USER_GROUP_UPDATED', ({ id }) => {
    dispatch.fetchUserGroup({ userGroupId: id })
  })
  listener.on('USER_GROUP_DELETED', ({ id }) => {
    dispatch.deleteUserGroup(id)
  })

  listener.on('reconnect', () => {
    dispatch.fetchUsers({ force: true })
    dispatch.fetchUserGroups({ force: true })
  })
})
