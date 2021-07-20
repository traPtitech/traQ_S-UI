import {
  Apis,
  ChannelEvent,
  ChannelEventTypeEnum,
  ChildCreatedEvent,
  Configuration,
  ForcedNotificationChangedEvent,
  NameChangedEvent,
  ParentChangedEvent,
  PinAddedEvent,
  PinRemovedEvent,
  SubscribersChangedEvent,
  TopicChangedEvent,
  VisibilityChangedEvent
} from '@traptitech/traq'
import { FileId } from '/@/types/entity-ids'
import DEV_SERVER from '/@/lib/env/devServer'
import { AxiosError } from 'axios'

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
  | BaseChannelEvent<ChannelEventTypeEnum.TopicChanged, TopicChangedEvent>
  | BaseChannelEvent<
      ChannelEventTypeEnum.SubscribersChanged,
      SubscribersChangedEvent
    >
  | BaseChannelEvent<ChannelEventTypeEnum.PinAdded, PinAddedEvent>
  | BaseChannelEvent<ChannelEventTypeEnum.PinRemoved, PinRemovedEvent>
  | BaseChannelEvent<ChannelEventTypeEnum.NameChanged, NameChangedEvent>
  | BaseChannelEvent<ChannelEventTypeEnum.ParentChanged, ParentChangedEvent>
  | BaseChannelEvent<
      ChannelEventTypeEnum.VisibilityChanged,
      VisibilityChangedEvent
    >
  | BaseChannelEvent<
      ChannelEventTypeEnum.ForcedNotificationChanged,
      ForcedNotificationChangedEvent
    >
  | BaseChannelEvent<ChannelEventTypeEnum.ChildCreated, ChildCreatedEvent>

export const parseChannelEvent = (event: ChannelEvent): ParsedChannelEvent =>
  event as ParsedChannelEvent

export default apis
