import { createDefineListeners } from '../utils/defineListeners'
import { wsListener } from '/@/lib/websocket'
import { entities } from '.'

export const defineWsListeners = createDefineListeners<typeof entities>()(
  wsListener,
  (listener, { dispatch }) => {
    listener.on('USER_JOINED', ({ id }) => {
      dispatch.fetchUser({ userId: id })
    })
    listener.on('USER_UPDATED', ({ id }) => {
      dispatch.fetchUser({ userId: id, cacheStrategy: 'forceFetch' })
    })
    listener.on('USER_LEFT', ({ id }) => {
      dispatch.deleteUser(id)
    })
    listener.on('USER_ICON_UPDATED', ({ id }) => {
      dispatch.fetchUser({ userId: id, cacheStrategy: 'forceFetch' })
    })

    listener.on('USER_GROUP_CREATED', ({ id }) => {
      dispatch.fetchUserGroup({ userGroupId: id })
    })
    listener.on('USER_GROUP_UPDATED', ({ id }) => {
      dispatch.fetchUserGroup({ userGroupId: id, cacheStrategy: 'forceFetch' })
    })
    listener.on('USER_GROUP_DELETED', ({ id }) => {
      dispatch.deleteUserGroup(id)
    })

    listener.on('CHANNEL_CREATED', ({ id, dm_user_id }) => {
      dispatch.addChannel({ channelId: id, dmUserId: dm_user_id })
    })
    listener.on('CHANNEL_UPDATED', ({ id, dm_user_id }) => {
      dispatch.updateChannel({ channelId: id, dmUserId: dm_user_id })
    })
    listener.on('CHANNEL_DELETED', ({ id }) => {
      dispatch.deleteChannel(id)
    })

    listener.on('CLIP_FOLDER_CREATED', ({ id }) => {
      dispatch.fetchClipFolder({ clipFolderId: id })
    })
    listener.on('CLIP_FOLDER_UPDATED', ({ id }) => {
      dispatch.fetchClipFolder({
        clipFolderId: id,
        cacheStrategy: 'forceFetch'
      })
    })
    listener.on('CLIP_FOLDER_DELETED', ({ id }) => {
      dispatch.deleteClipFolders(id)
    })

    listener.on('STAMP_CREATED', ({ id }) => {
      dispatch.fetchStamp({ stampId: id })
    })
    listener.on('STAMP_UPDATED', ({ id }) => {
      dispatch.fetchStamp({ stampId: id, cacheStrategy: 'forceFetch' })
    })
    listener.on('STAMP_DELETED', ({ id }) => {
      dispatch.deleteStamp(id)
    })

    listener.on('STAMP_PALETTE_CREATED', ({ id }) => {
      // eslint-disable-next-line no-console
      console.error('onStampPaletteCreated: Not implemented')
    })
    listener.on('STAMP_PALETTE_UPDATED', ({ id }) => {
      // eslint-disable-next-line no-console
      console.error('onStampPaletteUpdated: Not implemented')
    })
    listener.on('STAMP_PALETTE_DELETED', ({ id }) => {
      // eslint-disable-next-line no-console
      console.error('onStampPaletteDeleted: Not implemented')
    })

    listener.on('reconnect', () => {
      dispatch.fetchUsers({ ignoreCache: true })
      dispatch.fetchUserGroups({ ignoreCache: true })
      dispatch.fetchChannels({ ignoreCache: true })
      dispatch.fetchClipFolders({ ignoreCache: true })
      dispatch.fetchStamps({ ignoreCache: true })
      dispatch.fetchStampPalettes({ ignoreCache: true })
    })
  }
)
