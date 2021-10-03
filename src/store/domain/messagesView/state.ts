import { MessageId, ChannelId, ClipFolderId } from '/@/types/entity-ids'
import { Pin, ChannelViewer } from '@traptitech/traq'
import type { EmbeddingOrUrl } from '@traptitech/traq-markdown-it'

export type LoadingDirection = 'former' | 'latter' | 'around' | 'latest'

export interface S {
  // FIXME: 分離

  /** 現在のチャンネルID、日時ベースのフェッチを行う */
  currentChannelId?: ChannelId

  /** 現在のクリップフォルダID、オフセットベースのフェッチを行う */
  currentClipFolderId?: ClipFolderId

  pinnedMessages: Pin[]

  /**
   * 最新のメッセージを受信する状態かどうか
   *
   * `isReachedLatest`と同期する必要がある
   */
  receiveLatestMessages: boolean

  renderedContentMap: Map<MessageId, string>

  embeddingsMap: Map<MessageId, EmbeddingOrUrl[] | undefined>

  /** チャンネルを見ている人の一覧(古い順) */
  currentViewers: ChannelViewer[]

  /** 現在編集中のメッセージID */
  editingMessageId?: MessageId

  /** 現在のチャンネルの最古の未読メッセージの投稿日時 */
  unreadSince: string | undefined
}

export const state: S = {
  currentChannelId: undefined,
  currentClipFolderId: undefined,
  pinnedMessages: [],
  renderedContentMap: new Map(),
  embeddingsMap: new Map(),
  receiveLatestMessages: false,
  currentViewers: [],
  editingMessageId: undefined,
  unreadSince: undefined
}
