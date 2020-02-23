import Vue from 'vue'
import {
  User,
  UserGroup,
  Channel,
  Stamp,
  StampPalette,
  Webhook
} from 'traq-api-v3'
import { createMutations } from 'direct-vuex'
import { S } from './state'
import {
  UserId,
  ChannelId,
  UserGroupId,
  StampPaletteId,
  StampId,
  WebhookId
} from '@/types/entity-ids'

const setMutation = <I extends string, T>(key: keyof S) => (
  state: S,
  entities: Record<I, T>
) => {
  state[key] = entities
}
const extendMutation = <I extends string, T>(key: keyof S) => (
  state: S,
  entities: Record<I, T>
) => {
  state[key] = { ...state[key], ...entities }
}
const addMutation = <I extends string, T>(key: keyof S) => (
  state: S,
  payload: { id: I; entity: T }
) => {
  Vue.set(state.users, payload.id, payload.entity)
}

export const mutations = createMutations<S>()({
  setUsers: setMutation<UserId, User>('users'),
  setChannels: setMutation<ChannelId, Channel>('channels'),
  setUserGroups: setMutation<UserGroupId, UserGroup>('userGroups'),
  setStamps: setMutation<StampId, Stamp>('stamps'),
  setStampPalettes: setMutation<StampPaletteId, Stamp>('stampPalettes'),
  setWebhooks: setMutation<WebhookId, Webhook>('webhooks'),

  extendUsers: extendMutation<UserId, User>('users'),
  extendChannels: extendMutation<ChannelId, Channel>('channels'),
  extendUserGroups: extendMutation<UserGroupId, UserGroup>('userGroups'),
  extendStamps: extendMutation<StampId, Stamp>('stamps'),
  extendStampPalettes: extendMutation<StampPaletteId, Stamp>('stampPalettes'),
  extendWebhooks: extendMutation<WebhookId, Webhook>('webhooks'),

  addUser: addMutation<UserId, User>('users'),
  addChannel: addMutation<ChannelId, Channel>('channels'),
  addUserGroup: addMutation<UserGroupId, UserGroup>('userGroups'),
  addStamp: addMutation<StampId, Stamp>('stamps'),
  addStampPalette: addMutation<StampPaletteId, Stamp>('stampPalettes'),
  addWebhook: addMutation<WebhookId, Webhook>('webhooks')
})
