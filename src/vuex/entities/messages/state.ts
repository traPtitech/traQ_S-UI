import { FileInfo, Message, Ogp } from '@traptitech/traq'
import { ExternalUrl, FileId, MessageId } from '/@/types/entity-ids'

export type S = {
  /**
   * ここでは内容が更新されることのみを保障する
   * それぞれの方でメッセージIDの追加、削除の更新はする必要がある
   */
  messagesMap: Map<MessageId, Message>
  /*
    TODO: メッセージ一覧を取得するPromiseをここに置く
    さらにabortControllerをここにおけば、Promise変わったときにabortすることで
    同時に取得するのを止められる
  */
  fileMetaDataMap: Map<FileId, FileInfo>
  ogpDataMap: Map<ExternalUrl, Ogp>
}

export const state: S = {
  messagesMap: new Map(),
  fileMetaDataMap: new Map(),
  ogpDataMap: new Map()
}
