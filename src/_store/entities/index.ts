import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import {
  MessageId,
  DMChannelId,
  WebhookId,
  FileId,
  TagId,
  ClipFolderId,
  StampId,
  ExternalUrl
} from '@/types/entity-ids'
import {
  Message,
  DMChannel,
  Webhook,
  FileInfo,
  Tag,
  ClipFolder,
  Stamp,
  Ogp
} from '@traptitech/traq'

export type MessageMap = Record<MessageId, Message>
export type DMChannelMap = Record<DMChannelId, DMChannel>
export type StampMap = Record<StampId, Stamp>
export type WebhookMap = Record<WebhookId, Webhook>
export type FileMetaDataMap = Record<FileId, FileInfo>
export type TagMap = Record<TagId, Tag>
export type ClipFolderMap = Record<ClipFolderId, ClipFolder>
export type OgpDataMap = Record<ExternalUrl, Ogp>

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
