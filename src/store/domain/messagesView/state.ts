import { MessageId, ChannelId } from '@/types/entity-ids'
import { EmbeddedFile } from '@/lib/embeddingExtractor'

export type LoadingDirection = 'former' | 'latter' | 'around' | 'latest'

export interface S {
  currentChannelId: ChannelId

  /** 現在表示対象になっている全てのメッセージID */
  messageIds: MessageId[]

  /** 読み込まれているメッセージのうち、最も新しいものの日時 */
  loadedMessageLatestDate: Date | undefined

  /** 読み込まれているメッセージのうち、最も古いものの日時 */
  loadedMessageOldestDate: Date | undefined

  /** 初回のロードのみしか行われていないか */
  isInitialLoad: boolean

  /** 最後に行った読み込みの方向 */
  lastLoadingDirection: LoadingDirection

  /** チャンネルの過去方向全てのメッセージを取得したか */
  isReachedEnd: boolean

  /**
   * チャンネルの未来方向全てのメッセージを取得したか
   *
   * `true`になった以降はWebSocketによる通知に対応する必要がある
   */
  isReachedLatest: boolean

  /** 最初に表示するメッセージId */
  entryMessageId?: MessageId

  fetchLimit: number

  renderedContentMap: Record<MessageId, string>

  embeddedFilesMap: Record<MessageId, EmbeddedFile[]>
}

export const state: S = {
  currentChannelId: '',
  messageIds: [],
  loadedMessageLatestDate: undefined,
  loadedMessageOldestDate: undefined,
  isInitialLoad: false,
  lastLoadingDirection: 'latest',
  fetchLimit: 50,
  renderedContentMap: {},
  embeddedFilesMap: {},
  entryMessageId: undefined,
  isReachedEnd: false,
  isReachedLatest: false
}
