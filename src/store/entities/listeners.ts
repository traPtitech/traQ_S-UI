import { defineListeners } from '../utils/defineListeners'
import { wsListener } from '@/lib/websocket'

export const listeners = defineListeners(
  wsListener,
  'entities',
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

    listener.on('CHANNEL_CREATED', ({ id }) => {
      // TODO: いい感じにする
    })
    listener.on('CHANNEL_UPDATED', ({ id }) => {
      // TODO: いい感じにする
    })
    listener.on('CHANNEL_DELETED', ({ id }) => {
      // DMは削除されない
      dispatch.deleteChannel(id)
    })

    listener.on('CLIP_FOLDER_CREATED', ({ id }) => {
      dispatch.fetchClipFolder({ clipFolderId: id })
    })
    listener.on('CLIP_FOLDER_UPDATED', ({ id }) => {
      dispatch.fetchClipFolder({ clipFolderId: id })
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
      dispatch.fetchUsers({ force: true })
      dispatch.fetchUserGroups({ force: true })
      dispatch.fetchChannels({ force: true })
      dispatch.fetchClipFolders({ force: true })
      dispatch.fetchStamps({ force: true })
      dispatch.fetchStampPalettes({ force: true })
    })
  }
)
