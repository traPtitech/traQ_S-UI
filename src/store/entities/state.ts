import { UserGroup, Stamp, StampPalette, Channel } from '@traptitech/traq'
import {
  UserGroupId,
  StampId,
  StampPaletteId,
  ChannelId
} from '@/types/entity-ids'
import {
  UserMap,
  MessageMap,
  Undefinedable,
  DMChannelMap,
  WebhookMap,
  FileMetaDataMap,
  TagMap,
  ClipFolderMap
} from '.'

export type S = {
  users: Undefinedable<UserMap>
  messages: Undefinedable<MessageMap>
  channels: Record<ChannelId, Channel>
  dmChannels: DMChannelMap
  userGroups: Record<UserGroupId, UserGroup>
  stamps: Record<StampId, Stamp>
  stampPalettes: Record<StampPaletteId, StampPalette>
  webhooks: Undefinedable<WebhookMap>
  fileMetaData: Undefinedable<FileMetaDataMap>
  tags: Undefinedable<TagMap>
  clipFolders: Undefinedable<ClipFolderMap>
}

export const state: S = {
  users: {},
  messages: {},
  channels: {},
  dmChannels: {},
  userGroups: {},
  stamps: {},
  stampPalettes: {},
  webhooks: {},
  fileMetaData: {},
  tags: {},
  clipFolders: {}
}
