import {
  User,
  UserGroup,
  Channel,
  Stamp,
  StampPalette,
  Webhook,
  Message,
  FileInfo,
  Tag,
  ClipFolder,
  DMChannel
} from '@traptitech/traq'
import {
  UserId,
  ChannelId,
  UserGroupId,
  TagId,
  StampId,
  StampPaletteId,
  WebhookId,
  MessageId,
  FileId,
  ClipFolderId,
  DMChannelId
} from '@/types/entity-ids'

export type S = {
  users: Record<UserId, User | undefined>
  messages: Record<MessageId, Message | undefined>
  channels: Record<ChannelId, Channel>
  dmChannels: Record<DMChannelId, DMChannel>
  userGroups: Record<UserGroupId, UserGroup>
  stamps: Record<StampId, Stamp>
  stampPalettes: Record<StampPaletteId, StampPalette>
  webhooks: Record<WebhookId, Webhook | undefined>
  fileMetaData: Record<FileId, FileInfo | undefined>
  tags: Record<TagId, Tag | undefined>
  clipFolders: Record<ClipFolderId, ClipFolder | undefined>
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
