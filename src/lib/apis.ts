import { Apis, Configuration } from '@traptitech/traq'
import { FileId } from '@/types/entity-ids'
import DEV_SERVER from '@/lib/env/devServer'

export const BASE_PATH = '/api/v3'
export const WEBSOCKET_ENDPOINT = '/api/v3/ws'

const apis = new Apis(
  new Configuration({
    basePath: BASE_PATH
  })
)

export const buildFilePath = (fileId: FileId) => `${BASE_PATH}/files/${fileId}`

export const buildUserIconPath = (userIconFileId: FileId) =>
  `${BASE_PATH}/files/${userIconFileId}`

export const buildFileThumbnailPath = (fileId: FileId) =>
  `${BASE_PATH}/files/${fileId}/thumbnail`

export const buildFileWaveformPath = (fileId: FileId) =>
  `${buildFileThumbnailPath(fileId)}?type=waveform`

export const embeddingOrigin =
  DEV_SERVER !== '' &&
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? DEV_SERVER
    : `${location.protocol}//${location.host}`
export const buildFilePathForPost = (fileId: FileId) =>
  `${embeddingOrigin}/files/${fileId}`

export const OAuthDecidePath = `${BASE_PATH}/oauth2/authorize/decide`

export default apis
