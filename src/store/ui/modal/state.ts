import {
  UserId,
  ChannelId,
  FileId,
  UserGroupId,
  TagId
} from '@/types/entity-ids'
import { RouteName } from '@/router'

type ModalStateType =
  | 'user'
  | 'group'
  | 'notification'
  | 'file'
  | 'setting'
  | 'tag'
  | 'group'
  | 'channel-create'
  | 'qrcode'

export type ModalState =
  | UserModalState
  | NotificationModalState
  | FileModalState
  | SettingModalState
  | GroupModalState
  | TagModalState
  | ChannelCreateModalState
  | QrCodeModalState

interface BaseModalState {
  /** モーダル種別 */
  type: ModalStateType

  /** モーダルがルートに紐づいているか (例: ファイルモーダル) */
  relatedRoute?: RouteName
}

interface UserModalState extends BaseModalState {
  type: 'user'
  id: UserId
}

interface NotificationModalState extends BaseModalState {
  type: 'notification'
  channelId: ChannelId
}

interface FileModalState extends BaseModalState {
  type: 'file'
  id: FileId
  relatedRoute: RouteName.File
}

interface SettingModalState extends BaseModalState {
  type: 'setting'
}

interface GroupModalState extends BaseModalState {
  type: 'group'
  id: UserGroupId
}

interface TagModalState extends BaseModalState {
  type: 'tag'
  id: TagId
}

interface ChannelCreateModalState extends BaseModalState {
  type: 'channel-create'

  /**
   * 親チャンネルのID
   *
   * 指定しない場合はルートチャンネル作成
   */
  parentChannelId?: ChannelId
}

interface QrCodeModalState extends BaseModalState {
  type: 'qrcode'
}

export interface S {
  modalState: ModalState[]

  /** ロード時からモーダルを表示していて、そこからモーダルを閉じたことがないか */
  isOnInitialModalRoute: boolean

  /** モーダルを非表示にしようとしている最中か */
  isClearingModal: boolean
}

export const state: S = {
  modalState: [],
  isOnInitialModalRoute: false,
  isClearingModal: false
}
