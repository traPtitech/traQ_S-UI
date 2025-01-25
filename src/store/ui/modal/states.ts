import type { RouteName } from '/@/router'
import type {
  UserId,
  ChannelId,
  FileId,
  UserGroupId,
  TagId,
  MessageId,
  StampId
} from '/@/types/entity-ids'

export type ModalStateType =
  | 'user'
  | 'group'
  | 'notification'
  | 'file'
  | 'tag'
  | 'channel-create'
  | 'qrcode'
  | 'clip-create'
  | 'clip-folder-create'
  | 'channel-manage'
  | 'group-create'
  | 'group-member-edit'
  | 'group-admin-add'
  | 'group-member-add'
  | 'settings-stamp-create'
  | 'settings-stamp-edit'
  | 'settings-stamp-image-edit'
  | 'settings-profile-icon-edit'
  | 'settings-cache-clear'
  | 'settings-theme-edit'

export type ModalState =
  | UserModalState
  | NotificationModalState
  | FileModalState
  | GroupModalState
  | TagModalState
  | ChannelCreateModalState
  | QrCodeModalState
  | ClipCreateModalState
  | ClipFolderCreateModalState
  | ChannelManageModalState
  | GroupCreateModalState
  | GroupMemberEditModalState
  | GroupAdminAddModalState
  | GroupMemberAddModalState
  | SettingsStampCreateModalState
  | SettingsStampEditModalState
  | SettingsStampImageEditModalState
  | SettingsProfileIconEdit
  | SettingsCacheClearModalState
  | SettingsThemeEditState

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
   * 指定しない場合は親チャンネルが指定可能な作成画面になる
   */
  parentChannelId?: ChannelId
}

interface QrCodeModalState extends BaseModalState {
  type: 'qrcode'
}

interface ClipCreateModalState extends BaseModalState {
  type: 'clip-create'
  messageId: MessageId
}

interface ClipFolderCreateModalState extends BaseModalState {
  type: 'clip-folder-create'
}

interface ChannelManageModalState extends BaseModalState {
  type: 'channel-manage'
  id: ChannelId
}

interface GroupCreateModalState extends BaseModalState {
  type: 'group-create'
}

interface GroupMemberEditModalState extends BaseModalState {
  type: 'group-member-edit'
  groupId: UserGroupId
  userId: UserId
}

interface GroupAdminAddModalState extends BaseModalState {
  type: 'group-admin-add'
  id: UserGroupId
}

interface GroupMemberAddModalState extends BaseModalState {
  type: 'group-member-add'
  id: UserGroupId
}

interface SettingsStampCreateModalState extends BaseModalState {
  type: 'settings-stamp-create'
  file: File
}

interface SettingsStampEditModalState extends BaseModalState {
  type: 'settings-stamp-edit'
  id: StampId
}

interface SettingsStampImageEditModalState extends BaseModalState {
  type: 'settings-stamp-image-edit'
  id: StampId
  file: File
}

interface SettingsProfileIconEdit extends BaseModalState {
  type: 'settings-profile-icon-edit'
  file: File
}

interface SettingsCacheClearModalState extends BaseModalState {
  type: 'settings-cache-clear'
}

interface SettingsThemeEditState extends BaseModalState {
  type: 'settings-theme-edit'
}
