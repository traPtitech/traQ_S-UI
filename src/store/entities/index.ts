import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import {
  UserId,
  MessageId,
  DMChannelId,
  WebhookId,
  FileId,
  TagId,
  ClipFolderId
} from '@/types/entity-ids'
import {
  User,
  Message,
  DMChannel,
  Webhook,
  FileInfo,
  Tag,
  ClipFolder
} from '@traptitech/traq'

export type UserMap = Record<UserId, User>
export type MessageMap = Record<MessageId, Message>
export type DMChannelMap = Record<DMChannelId, DMChannel>
export type WebhookMap = Record<WebhookId, Webhook>
export type FileMetaDataMap = Record<FileId, FileInfo>
export type TagMap = Record<TagId, Tag>
export type ClipFolderMap = Record<ClipFolderId, ClipFolder>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Undefinedable<T extends Record<string, any>> = Partial<T>

/**
 * サーバーから取得したエンティティを扱うstore
 *
 * このモジュールのstateは id => body の形をしたRecordのみ許す
 */
export const entities = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
