import { ClipFolderId, ChannelId, MessageId, UserId } from '@/types/entity-ids'

export type ViewType = 'channel' | 'qall' | 'clips' | 'dm'
export interface ViewInformationBase {
  type: ViewType
}
export type ViewInformation = ChannelView | QallView | ClipsView | DMView

export type LayoutType = 'single' | 'split' | 'split-reverse'

export interface ChannelView extends ViewInformationBase {
  type: 'channel'
  /** まだ使われていない */
  channelId: ChannelId
  entryMessageId?: MessageId
}
export interface QallView extends ViewInformationBase {
  type: 'qall'
}
export interface ClipsView extends ViewInformationBase {
  type: 'clips'
  clipFolderId: ClipFolderId
}
export interface DMView extends ViewInformationBase {
  type: 'dm'
  userId: UserId
}

/**
 * ナビゲーションとサイドバーの表示状態を表すステートマシンの状態
 *
 * SEE: https://github.com/traPtitech/traQ_S-UI/pull/321#discussion_r410817394
 */
export enum MainViewComponentState {
  Hidden = 'hidden',
  SidebarAppearing = 'sidebar-appearing',
  SidebarAppearingAuto = 'sidebar-appearing-auto',
  SidebarAppearingWaitingTouchEnd = 'sidebar-appearing-waiting-touch-end',
  SidebarDisappearing = 'sidebar-disappearing',
  SidebarDisappearingAuto = 'sidebar-disappearing-auto',
  SidebarDisappearingWaitingTouchEnd = 'sidebar-disappearing-waiting-touch-end',
  SidebarShown = 'sidebar-shown',
  NavAppearing = 'nav-appearing',
  NavAppearingAuto = 'nav-appearing-auto',
  NavAppearingWaitingTouchEnd = 'nav-appearing-waiting-touch-end',
  NavDisappearing = 'nav-disappearing',
  NavDisappearingAuto = 'nav-disappearing-auto',
  NavDisappearingWaitingTouchEnd = 'nav-disappearing-waiting-touch-end',
  NavShown = 'nav-shown'
}

export interface S {
  layout: LayoutType
  isSidebarOpen: boolean
  currentMainViewComponentState: MainViewComponentState
  primaryView: ViewInformation
  secondaryView?: ViewInformation
}

export const state: S = {
  layout: 'single',
  isSidebarOpen: false,
  currentMainViewComponentState: MainViewComponentState.Hidden,
  primaryView: {
    type: 'channel',
    channelId: '',
    entryMessageId: undefined
  },
  secondaryView: undefined
}
