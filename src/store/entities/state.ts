import {
  User,
  UserGroup,
  Channel,
  Stamp,
  // StampPalette,
  Webhook,
  Message
} from '@/lib/api'
import {
  UserId,
  ChannelId,
  UserGroupId,
  StampId,
  StampPaletteId,
  WebhookId,
  MessageId
} from '@/types/entity-ids'

export interface S {
  users: Record<UserId, User>
  messages: Record<MessageId, Message>
  channels: Record<ChannelId, Channel>
  userGroups: Record<UserGroupId, UserGroup>
  stamps: Record<StampId, Stamp>
  // stampPalettes: Record<StampPaletteId, StampPalette>
  webhooks: Record<WebhookId, Webhook>
}

export const state: S = {
  users: {},
  messages: {},
  channels: {},
  userGroups: {},
  stamps: {},
  // stampPalettes: {},
  webhooks: {}
}
