import { Apis } from '@traptitech/traq'
import { UserId, FileId } from '@/types/entity-ids'

export const BASE_PATH = '/api/v3'
export const WEBSOCKET_ENDPOINT = '/api/v3/ws'

const apis = new Apis({
  basePath: BASE_PATH
})

export const buildStampImagePath = (stampFileId: UserId) =>
  `${BASE_PATH}/files/${stampFileId}`

export const buildUserIconPath = (userId: UserId) =>
  `${BASE_PATH}/users/${userId}/icon`

export const filePathOrigin =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'https://traq-s-dev.tokyotech.org'
    : `${location.protocol}//${location.host}`
export const buildFilePath = (fileId: FileId) =>
  `${filePathOrigin}/files/${fileId}`

export * from '@traptitech/traq'
export default apis
