import type {
  ChannelEvent,
  ChannelEventTypeEnum,
  ChildCreatedEvent,
  ForcedNotificationChangedEvent,
  NameChangedEvent,
  ParentChangedEvent,
  PinAddedEvent,
  PinRemovedEvent,
  Session,
  SubscribersChangedEvent,
  TopicChangedEvent,
  VisibilityChangedEvent
} from '@traptitech/traq'
import { Apis, Configuration } from '@traptitech/traq'
import type { FileId } from '/@/types/entity-ids'
import { DEV_SERVER } from '/@/lib/define'
import type { AxiosError } from 'axios'
import { constructFilesPath } from '/@/router'

export type { Session as WebRTCUserStateSessions }

export const BASE_PATH = '/api/v3'
export const WEBSOCKET_ENDPOINT = '/api/v3/ws'

const apis = new Apis(
  new Configuration({
    basePath: BASE_PATH
  })
)

export default apis

export const buildFilePath = (fileId: FileId, withDlParam = false) =>
  `${BASE_PATH}/files/${fileId}${withDlParam ? '?dl=1' : ''}`

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
  `${embeddingOrigin}${constructFilesPath(fileId)}`

/**
 * アイコンが変わったあとにすぐに変わらないので
 * 使える場合は`buildUserIconPath`を優先して使う
 */
export const buildUserIconPathPublic = (username: string) =>
  `${embeddingOrigin}${BASE_PATH}/public/icon/${username}`

export const OAuthDecidePath = `${BASE_PATH}/oauth2/authorize/decide`

/**
 * サーバーでの処理が必要なURLかどうかを判定する
 *
 * 例えば、`/api/v3/oauth2/authorize`は`router.replace`ではなくサーバーへのGETが必要
 * ([詳細](https://github.com/traPtitech/traQ/pull/1413))
 *
 * @param url 判定するURL (相対URLだった場合はlocation.hrefをbaseとして絶対URLに変換して判定する)
 */
export const isServerRequestUrl = (url: string) => {
  try {
    const u = new URL(url, location.href)
    if (u.origin === location.origin) {
      if (u.pathname === '/api/v3/oauth2/authorize') {
        return true
      }
    }
  } catch {}
  return false
}

export const formatResizeError = (e: unknown, defaultMessage: string) => {
  if (typeof e === 'string') return e

  if (typeof e !== 'object' || e === null) return defaultMessage
  if (!('response' in e)) return defaultMessage

  const response = (e as AxiosError<{ message: string }>).response
  if (!response) return defaultMessage

  const message = response.data.message
  if (message === 'too large image') {
    return '画像が大きすぎます'
  }
  if (message === 'bad image') {
    return '不正な画像です'
  }
  return defaultMessage
}

type BaseChannelEvent<Type, Detail> = {
  type: Type
  datetime: string
  detail: Detail
}

export type ParsedChannelEvent =
  | BaseChannelEvent<
      typeof ChannelEventTypeEnum.TopicChanged,
      TopicChangedEvent
    >
  | BaseChannelEvent<
      typeof ChannelEventTypeEnum.SubscribersChanged,
      SubscribersChangedEvent
    >
  | BaseChannelEvent<typeof ChannelEventTypeEnum.PinAdded, PinAddedEvent>
  | BaseChannelEvent<typeof ChannelEventTypeEnum.PinRemoved, PinRemovedEvent>
  | BaseChannelEvent<typeof ChannelEventTypeEnum.NameChanged, NameChangedEvent>
  | BaseChannelEvent<
      typeof ChannelEventTypeEnum.ParentChanged,
      ParentChangedEvent
    >
  | BaseChannelEvent<
      typeof ChannelEventTypeEnum.VisibilityChanged,
      VisibilityChangedEvent
    >
  | BaseChannelEvent<
      typeof ChannelEventTypeEnum.ForcedNotificationChanged,
      ForcedNotificationChangedEvent
    >
  | BaseChannelEvent<
      typeof ChannelEventTypeEnum.ChildCreated,
      ChildCreatedEvent
    >

export const parseChannelEvent = (event: ChannelEvent): ParsedChannelEvent =>
  event as ParsedChannelEvent
