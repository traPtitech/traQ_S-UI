import { User, UserGroup, Channel, Stamp, StampPalette } from 'traq-api-v3'
import {
  UserId,
  ChannelId,
  UserGroupId,
  StampId,
  StampPaletteId,
  WebhookId
} from '@/types/entity-ids'

export interface S {
  users: Record<UserId, User>
  channels: Record<ChannelId, Channel>
  userGroups: Record<UserGroupId, UserGroup>
  stamps: Record<StampId, Stamp>
  stampPalettes: Record<StampPaletteId, StampPalette>
  webhooks: Record<WebhookId, Stamp>
}

export const state: S = {
  users: {},
  channels: {},
  userGroups: {},
  stamps: {},
  stampPalettes: {},
  webhooks: {}
}
