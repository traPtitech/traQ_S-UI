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

export const mutations = createMutations<S>()({
  setUsers(state, entities: Record<UserId, User>) {
    state.users = entities
  },
  setChannels(state, entities: Record<ChannelId, Channel>) {
    state.channels = entities
  },
  setUserGroups(state, entities: Record<UserGroupId, UserGroup>) {
    state.userGroups = entities
  },
  setStamps(state, entities: Record<StampId, Stamp>) {
    state.stamps = entities
  },
  setStampPalettes(state, entities: Record<StampPaletteId, StampPalette>) {
    state.stampPalettes = entities
  },
  setWebhooks(state, entities: Record<WebhookId, Webhook>) {
    state.webhooks = entities
  },

  updateUsers(state, entities: Record<UserId, User>) {
    state.users = { ...state.users, ...entities }
  },
  updateChannels(state, entities: Record<ChannelId, Channel>) {
    state.channels = { ...state.channels, ...entities }
  },
  updateUserGroups(state, entities: Record<UserGroupId, UserGroup>) {
    state.userGroups = { ...state.userGroups, ...entities }
  },
  updateStamps(state, entities: Record<StampId, Stamp>) {
    state.stamps = { ...state.stamps, ...entities }
  },
  updateStampPalettes(state, entities: Record<StampPaletteId, StampPalette>) {
    state.stampPalettes = { ...state.stampPalettes, ...entities }
  },
  updateWebhooks(state, entities: Record<WebhookId, Webhook>) {
    state.webhooks = { ...state.webhooks, ...entities }
  },

  insertUsers(state, payload: { id: UserId; entity: User }) {
    Vue.set(state.users, payload.id, payload.entity)
  },
  insertChannel(state, payload: { id: ChannelId; entity: Channel }) {
    Vue.set(state.channels, payload.id, payload.entity)
  },
  insertUserGroup(state, payload: { id: UserGroupId; entity: UserGroup }) {
    Vue.set(state.userGroups, payload.id, payload.entity)
  },
  insertStamp(state, payload: { id: StampId; entity: Stamp }) {
    Vue.set(state.stamps, payload.id, payload.entity)
  },
  insertStampPalette(
    state,
    payload: { id: StampPaletteId; entity: StampPalette }
  ) {
    Vue.set(state.stampPalettes, payload.id, payload.entity)
  },
  insertWebhook(state, payload: { id: WebhookId; entity: Webhook }) {
    Vue.set(state.webhooks, payload.id, payload.entity)
  }
})
