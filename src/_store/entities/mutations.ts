import { defineMutations } from 'direct-vuex'
import { S } from './state'

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
  setFileMetaData: setMutation('fileMetaData'),
  setOgpData: setMutation('ogpData'),

  extendFileMetaData: extendMutation('fileMetaData'),
  extendOgpData: extendMutation('ogpData'),

  addFileMetaData: addMutation('fileMetaData'),
  addOgpData: addMutation('ogpData'),

  deleteFileMetaData: deleteMutation('fileMetaData'),
  deleteOgpData: deleteMutation('ogpData')
})
