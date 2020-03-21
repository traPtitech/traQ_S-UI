import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { entities } from './index'
import api from '@/lib/api'
import { ChannelId } from '@/types/entity-ids'

/**
 * オブジェクトの配列から特定のキーを用いたRecordを生成する
 * @param array 対象オブジェクトの配列
 * @param key Recordのキーにしたいオブジェクトのキー
 */
const reduceToRecord = <T>(array: T[], key: keyof T) =>
  array.reduce((acc, cur) => {
    const ck = cur[key]
    if (typeof ck !== 'string') return acc
    return { ...acc, [ck]: cur }
  }, {} as Record<string, T>)

export const entitiesActionContext = (context: any) =>
  moduleActionContext(context, entities)

export const actions = defineActions({
  async fetchUsers(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getUsers()
    commit.setUsers(reduceToRecord(res.data, 'id'))
  },
  async fetchChannels(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getChannels()
    // TODO: DM対応
    if (res.data.public) {
      commit.setChannels(reduceToRecord(res.data.public, 'id'))
    }
  },
  async fetchUserGroups(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getUserGroups()
    commit.setUserGroups(reduceToRecord(res.data, 'id'))
  },
  async fetchStamps(context) {
    throw 'Not Implemented'
    // const { commit } = entitiesActionContext(context)
    // const res = await api.getStamps()
    // commit.setStamps(reduceToRecord(res.data, 'id'))
  },
  async fetchStampPalettes(context) {
    throw 'Not Implemented'
    // const { commit } = entitiesActionContext(context)
    // const res = await api.getStampPalettes()
    // commit.setStampPalettes(reduceToRecord(res.data, 'id'))
  },
  async fetchMessagesByChannelId(context, channelId: ChannelId) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getMessages(channelId)
    commit.setMessages(reduceToRecord(res.data, 'id'))
  }
})
