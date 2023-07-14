import { computed, reactive } from 'vue'
import type {
  NavigationItemType,
  EphemeralNavigationItemType
} from './useNavigationConstructor'
import type { ThemeClaim } from '/@/lib/styles'
import { isDefined } from '/@/lib/basic/array'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'
import { useAudioController } from '/@/store/ui/audioController'
import { useAppRtcStore } from '/@/store/app/rtc'
import { useChannelsStore } from '/@/store/entities/channels'
import { useSubscriptionStore } from '/@/store/domain/subscription'

export type NavigationSelectorEntry = {
  type: NavigationItemType
  entryName: string
  iconName: string
  iconMdi?: boolean
  hasNotification?: boolean
}

export type EphemeralNavigationSelectorEntry = {
  type: EphemeralNavigationItemType
  itemName: string
  iconName: string
  iconMdi?: boolean
  colorClaim?: ThemeClaim<string> // 色
  selectOnAdd?: boolean
}

export const createItems = (notificationState: {
  channel: boolean
  dm: boolean
}): NavigationSelectorEntry[] => [
  {
    type: 'home',
    entryName: 'ホーム',
    iconName: 'home',
    iconMdi: true,
    hasNotification: notificationState.channel
  },
  {
    type: 'channels',
    entryName: 'チャンネル一覧',
    iconName: 'hash'
  },
  {
    type: 'activity',
    entryName: 'アクティビティ',
    iconName: 'activity'
  },
  {
    type: 'users',
    entryName: 'ユーザー一覧',
    iconName: 'user',
    hasNotification: notificationState.dm
  },
  {
    type: 'clips',
    entryName: 'クリップ一覧',
    iconName: 'bookmark',
    iconMdi: true
  }
]
export const ephemeralItems: Record<
  NonNullable<EphemeralNavigationItemType>,
  EphemeralNavigationSelectorEntry
> = {
  qallController: {
    type: 'qallController',
    itemName: 'Qall',
    iconName: 'phone',
    iconMdi: true,
    colorClaim: (_, common) => common.ui.qall,
    selectOnAdd: true
  },
  draftList: {
    type: 'draftList',
    itemName: '下書き一覧',
    iconName: 'pencil',
    iconMdi: true
  },
  audioController: {
    type: 'audioController',
    itemName: 'サウンド',
    iconName: 'music-note',
    iconMdi: true
  }
}

const useNavigationSelectorEntry = () => {
  const { isCurrentDevice: hasActiveQallSession } = useAppRtcStore()
  const { unreadChannelsMap } = useSubscriptionStore()
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const { hasInputChannel } = useMessageInputStateStore()
  const { fileId } = useAudioController()

  const unreadChannels = computed(() => [...unreadChannelsMap.value.values()])
  const notificationState = reactive({
    channel: computed(() =>
      unreadChannels.value.some(c => channelsMap.value.has(c.channelId))
    ),
    dm: computed(() =>
      unreadChannels.value.some(c => dmChannelsMap.value.has(c.channelId))
    )
  })
  const entries = computed(() => createItems(notificationState))

  const ephemeralEntries = computed(() =>
    [
      hasActiveQallSession.value ? ephemeralItems.qallController : undefined,
      hasInputChannel.value ? ephemeralItems.draftList : undefined,
      fileId.value ? ephemeralItems.audioController : undefined
    ].filter(isDefined)
  )

  return {
    entries,
    ephemeralEntries
  }
}
export default useNavigationSelectorEntry
