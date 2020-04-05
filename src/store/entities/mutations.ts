import Vue from 'vue'
import { Channel, MessageStamp } from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId } from '@/types/entity-ids'
import store from '..'
import {
  MessageStampedEvent,
  MessageUnstampedEvent
} from '@/lib/websocket/events'

type RecordKeyOf<R> = R extends Record<infer K, any> ? K : never
type RecordValueOf<R> = R extends Record<string, infer V> ? V : never

const setMutation = <O, K extends keyof O>(key: K) => (
  state: O,
  entities: O[K]
) => {
  state[key] = entities
}
const extendMutation = <O, K extends keyof O>(key: K) => (
  state: O,
  entities: O[K]
) => {
  state[key] = { ...state[key], ...entities }
}
const addMutation = <
  O extends Record<string, Record<string, any>>,
  K extends keyof O
>(
  key: K
) => (
  state: O,
  payload: { id: RecordKeyOf<O[K]>; entity: RecordValueOf<O[K]> }
) => {
  Vue.set(state[key], payload.id, payload.entity)
}
const deleteMutation = <
  O extends Record<string, Record<string, any>>,
  K extends keyof O
>(
  key: K
) => (state: O, entityId: RecordKeyOf<O[K]>) => {
  Vue.delete(state[key], entityId)
}

export const mutations = defineMutations<S>()({
  setUsers: setMutation('users'),
  setMessages: setMutation('messages'),
  setChannels(state, payload: Record<ChannelId, Channel>) {
    state.channels = payload
    store.dispatch.domain.channelTree.constructAllTrees()
  },
  setUserGroups: setMutation('userGroups'),
  setStamps: setMutation('stamps'),
  setStampPalettes: setMutation('stampPalettes'),
  setWebhooks: setMutation('webhooks'),

  extendUsers: extendMutation('users'),
  extendMessages: extendMutation('messages'),
  extendChannels: extendMutation('channels'),
  extendUserGroups: extendMutation('userGroups'),
  extendStamps: extendMutation('stamps'),
  extendStampPalettes: extendMutation('stampPalettes'),
  extendWebhooks: extendMutation('webhooks'),

  addUser: addMutation('users'),
  addChannel: addMutation('channels'),
  addUserGroup: addMutation('userGroups'),
  addStamp: addMutation('stamps'),
  addStampPalette: addMutation('stampPalettes'),
  addWebhook: addMutation('webhooks'),

  deleteUser: deleteMutation('users'),
  deleteChannel: deleteMutation('channels'),
  deleteUserGroup: deleteMutation('userGroups'),
  deleteStamp: deleteMutation('stamps'),
  deleteStampPalette: deleteMutation('stampPalettes'),
  deleteWebhook: deleteMutation('webhooks'),

  updateMessageStamp(
    state,
    payload: {
      messageId: MessageId
      messageStamp: MessageStamp
    }
  ) {}
})
