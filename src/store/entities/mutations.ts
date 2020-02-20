import { User, UserGroup, Channel, Stamp } from 'traq-api-v3'
import { createMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = createMutations<S>()({
  setUsers(state, users: Record<string, User>) {
    state.users = users
  },
  setChannels(state, channels: Record<string, User>) {
    state.channels = channels
  },
  setUserGroups(state, userGroups: Record<string, User>) {
    state.userGroups = userGroups
  },
  setStamps(state, stamps: Record<string, User>) {
    state.stamps = stamps
  },
  setStampPalettes(state, stampPalettes: Record<string, User>) {
    state.stampPalettes = stampPalettes
  }
})
