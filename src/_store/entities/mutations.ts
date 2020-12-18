import { MessageStamp } from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { S } from './state'
import {
  MessageStampedEvent,
  MessageUnstampedEvent
} from '@/lib/websocket/events'

type RecordKeyOf<R> = R extends Record<infer K, unknown> ? K : never
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
  O extends Record<string, Record<string, unknown>>,
  K extends keyof O
>(
  key: K
) => (
  state: O,
  payload: { id: RecordKeyOf<O[K]>; entity: RecordValueOf<O[K]> }
) => {
  const record = state[key] as Record<string, unknown>
  record[payload.id] = payload.entity
}
const deleteMutation = <
  O extends Record<string, Record<string, unknown>>,
  K extends keyof O
>(
  key: K
) => (state: O, entityId: RecordKeyOf<O[K]>) => {
  delete state[key][entityId]
}

export const mutations = defineMutations<S>()({
  setMessages: setMutation('messages'),
  setStampPalettes: setMutation('stampPalettes'),
  setFileMetaData: setMutation('fileMetaData'),
  setOgpData: setMutation('ogpData'),

  extendMessages: extendMutation('messages'),
  extendStampPalettes: extendMutation('stampPalettes'),
  extendFileMetaData: extendMutation('fileMetaData'),
  extendOgpData: extendMutation('ogpData'),

  addMessage: addMutation('messages'),
  addStampPalette: addMutation('stampPalettes'),
  addFileMetaData: addMutation('fileMetaData'),
  addOgpData: addMutation('ogpData'),

  deleteMessage: deleteMutation('messages'),
  deleteStampPalette: deleteMutation('stampPalettes'),
  deleteFileMetaData: deleteMutation('fileMetaData'),
  deleteOgpData: deleteMutation('ogpData'),

  onMessageStamped(state, e: MessageStampedEvent) {
    const message = state.messages[e.message_id]
    if (!message) return

    const { stamps } = message
    // 既に押されているスタンプは更新、新規は追加
    if (
      stamps.some(
        stamp => stamp.stampId === e.stamp_id && stamp.userId === e.user_id
      )
    ) {
      message.stamps = stamps.map(stamp =>
        stamp.stampId === e.stamp_id && stamp.userId === e.user_id
          ? { ...stamp, count: e.count, createdAt: e.created_at }
          : stamp
      )
    } else {
      const stamp: MessageStamp = {
        userId: e.user_id,
        stampId: e.stamp_id,
        count: e.count,
        createdAt: e.created_at,
        updatedAt: e.created_at
      }
      message.stamps.push(stamp)
    }
  },
  onMessageUnstamped(state, e: MessageUnstampedEvent) {
    const message = state.messages[e.message_id]
    if (!message) return

    message.stamps = message.stamps.filter(
      stamp => !(stamp.stampId === e.stamp_id && stamp.userId === e.user_id)
    )
  }
})
