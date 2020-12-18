import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { entities } from './index'
import apis from '@/lib/apis'
import { reduceToRecord } from '@/lib/util/record'
import {
  FileId,
  TagId,
  MessageId,
  ClipFolderId,
  ExternalUrl
} from '@/types/entity-ids'
import { ActionContext } from 'vuex'

interface BaseGetMessagesParams {
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
}
interface GetMessagesParams extends BaseGetMessagesParams {
  channelId: string
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
}

interface GetClipsParam {
  folderId: string
  limit?: number
  offset?: number
  order?: 'asc' | 'desc'
}

interface GetDirectMessagesParams extends BaseGetMessagesParams {
  userId: string
}

export const entitiesActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, entities)

export const actions = defineActions({
  async fetchStampPalettes(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getStampPalettes()
    commit.setStampPalettes(reduceToRecord(res.data, 'id'))
  },
  // TODO: ドメインデータっぽい
  async fetchMessagesInClipFolder(context, params: GetClipsParam) {
    const { commit } = entitiesActionContext(context)
    const { data, headers } = await apis.getClips(
      params.folderId,
      params.limit,
      params.offset,
      params.order
    )
    commit.extendMessages(
      reduceToRecord(
        data.map(c => c.message),
        'id'
      )
    )
    return {
      clips: data,
      hasMore: headers['x-traq-more'] === 'true'
    }
  },
  async fetchMessagesByChannelId(context, params: GetMessagesParams) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getMessages(
      params.channelId,
      params.limit,
      params.offset,
      params.since?.toISOString(),
      params.until?.toISOString(),
      params.inclusive,
      params.order
    )
    commit.extendMessages(reduceToRecord(res.data, 'id'))
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchMessage(context, messageId: MessageId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getMessage(messageId)
    commit.addMessage({ id: res.data.id, entity: res.data })
    return res.data
  },
  async fetchFileMetaByChannelId(
    context,
    { channelId, limit, offset }: GetFilesChannelParams
  ) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getFiles(channelId, limit, offset)
    commit.extendFileMetaData(reduceToRecord(res.data, 'id'))
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchFileMetaByFileId(context, fileId: FileId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getFileMeta(fileId)
    commit.addFileMetaData({ id: res.data.id, entity: res.data })
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchTag(context, tagId: TagId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getTag(tagId)
    commit.addTags({ id: res.data.id, entity: res.data })
  },
  async fetchClipFolders(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getClipFolders()
    commit.setClipFolders(reduceToRecord(res.data, 'id'))
  },
  async fetchClipFolder(context, id: ClipFolderId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getClipFolder(id)
    commit.addClipFolder({ id, entity: res.data })
    return res.data
  },
  async fetchOgpData(context, url: ExternalUrl) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getOgp(url)

    try {
      // 比較的例外起こしやすいのでここで取る
      commit.addOgpData({ id: url, entity: res.data })
      return res.data
    } catch {}
  }
})
