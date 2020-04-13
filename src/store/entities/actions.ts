import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { entities } from './index'
import api from '@/lib/api'
import { FileId, TagId } from '@/types/entity-ids'

/**
 * オブジェクトの配列から特定のキーを用いたRecordを生成する
 * @param array 対象オブジェクトの配列
 * @param key Recordのキーにしたいオブジェクトのキー
 */
const reduceToRecord = <T>(array: T[], key: keyof T) =>
  array.reduce((acc, cur) => {
    const ck = cur[key]
    if (typeof ck !== 'string') return acc
    return Object.assign(acc, { [ck]: cur })
  }, {} as Record<string, T>)

// TODO: リクエストパラメータの型置き場
interface GetMessagesParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
  options?: any
}

interface GetFilesChannelParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
  mine?: boolean
  options?: any
}

export const entitiesActionContext = (context: any) =>
  moduleActionContext(context, entities)

export const actions = defineActions({
  async fetchUser(context, userId: string) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getUser(userId)
    commit.addUser({ id: userId, entity: res.data })
  },
  async fetchUsers(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getUsers()
    commit.setUsers(reduceToRecord(res.data, 'id'))
  },
  async fetchChannels(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getChannels(true)
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
    const { commit } = entitiesActionContext(context)
    const res = await api.getStamps()
    commit.setStamps(reduceToRecord(res.data, 'id'))
  },
  async fetchStampPalettes(context) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getStampPalettes()
    commit.setStampPalettes(reduceToRecord(res.data, 'id'))
  },
  async fetchMessagesByChannelId(
    context,
    { channelId, limit, offset }: GetMessagesParams
  ) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getMessages(channelId, limit, offset)
    commit.extendMessages(reduceToRecord(res.data, 'id'))
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchFileMetaByChannelId(
    context,
    { channelId, limit, offset }: GetFilesChannelParams
  ) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getFiles(channelId, limit, offset)
    commit.extendFileMetaData(reduceToRecord(res.data, 'id'))
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchFileMetaByFileId(context, fileId: FileId) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getFileMeta(fileId)
    commit.addFileMetaData({ id: res.data.id, entity: res.data })
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchTag(context, tagId: TagId) {
    const { commit } = entitiesActionContext(context)
    const res = await api.getTag(tagId)
    commit.addTags({ id: res.data.id, entity: res.data })
  }
})
