import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { channelIdToPathString } from '/@/lib/channel'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import {
  ChannelId,
  ClipFolderId,
  DMChannelId,
  MessageId
} from '/@/types/entity-ids'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'

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
  channelId: DMChannelId
  userName: string
  entryMessageId?: MessageId
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

export type HeaderStyle = 'default' | 'dark'

const useMainViewStorePinia = defineStore('ui/mainView', () => {
  const { lastOpenChannelName } = useBrowserSettings()
  const messagesView = useMessagesView()
  const channelsStore = useChannelsStore()
  const usersStore = useUsersStore()

  const layout = ref<LayoutType>('single')

  const currentMainViewComponentState = ref(MainViewComponentState.Hidden)
  const isSidebarOpen = computed(
    () =>
      currentMainViewComponentState.value ===
      MainViewComponentState.SidebarShown
  )
  const isNavOpen = computed(
    () =>
      currentMainViewComponentState.value === MainViewComponentState.NavShown
  )
  const isNoComponentOpen = computed(
    () => currentMainViewComponentState.value === MainViewComponentState.Hidden
  )

  const lastScrollPosition = ref(0)
  const primaryView = ref<ViewInformation>({
    type: 'channel',
    channelId: '',
    entryMessageId: undefined
  })
  const secondaryView = ref<ViewInformation>()

  const headerStyle = computed((): HeaderStyle => {
    if (
      layout.value === 'split-reverse' &&
      secondaryView.value?.type === 'qall'
    ) {
      return 'dark'
    }
    return 'default'
  })

  const changePrimaryViewToChannelOrDM = async ({
    channelId,
    entryMessageId
  }: {
    channelId: ChannelId | DMChannelId
    entryMessageId?: MessageId
  }) => {
    const DMChannel = channelsStore.dmChannelsMap.value.get(channelId)
    if (DMChannel) {
      const user = await usersStore.fetchUser({
        userId: DMChannel.userId,
        cacheStrategy: 'useCache'
      })
      if (!user) {
        throw 'user not found'
      }

      changePrimaryViewToDM({
        channelId,
        entryMessageId,
        userName: user.name
      })
      return
    }
    changePrimaryViewToChannel({
      channelId,
      entryMessageId
    })
  }

  const changePrimaryViewToChannel = ({
    channelId,
    entryMessageId
  }: {
    channelId: ChannelId | DMChannelId
    entryMessageId?: MessageId
  }) => {
    primaryView.value = {
      type: 'channel',
      channelId,
      entryMessageId
    }
    messagesView.changeCurrentChannel({
      channelId,
      entryMessageId
    })

    // 通常のチャンネルは最後に開いたチャンネルとして保持
    const channelPath = channelIdToPathString(
      channelId,
      channelsStore.channelsMap.value
    )
    lastOpenChannelName.value = channelPath
  }

  const changePrimaryViewToDM = ({
    channelId,
    userName,
    entryMessageId
  }: {
    channelId: DMChannelId
    userName: string
    entryMessageId?: MessageId
  }) => {
    primaryView.value = {
      type: 'dm',
      channelId,
      userName,
      entryMessageId
    }
    messagesView.changeCurrentChannel({
      channelId,
      entryMessageId,
      isDM: true
    })
  }

  const changePrimaryViewToClip = ({
    clipFolderId
  }: {
    clipFolderId: ClipFolderId
  }) => {
    primaryView.value = {
      type: 'clips',
      clipFolderId
    }
    messagesView.changeCurrentClipFolder(clipFolderId)
  }

  return {
    layout,
    isSidebarOpen,
    isNavOpen,
    isNoComponentOpen,
    currentMainViewComponentState,
    lastScrollPosition,
    primaryView,
    secondaryView,
    headerStyle,

    changePrimaryViewToChannelOrDM,
    changePrimaryViewToChannel,
    changePrimaryViewToDM,
    changePrimaryViewToClip
  }
})

export const useMainViewStore = convertToRefsStore(useMainViewStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMainViewStorePinia, import.meta.hot)
  )
}
