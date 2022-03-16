import { computed, reactive } from 'vue'
import {
  NavigationItemType,
  EphemeralNavigationItemType
} from './useNavigationConstructor'
import { ThemeClaim } from '/@/lib/styles'
import { isDefined } from '/@/lib/basic/array'
import { useMessageInputStateBase } from '/@/store/ui/messageInputState'
import { useAudioController } from '/@/store/ui/audioController'
import { useAppRtcStore } from '/@/store/app/rtc'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'

export type NavigationSelectorEntry = {
  type: NavigationItemType
  iconName: string
  iconMdi?: boolean
  hasNotification?: boolean
}

export type EphemeralNavigationSelectorEntry = {
  type: EphemeralNavigationItemType
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
    iconName: 'home',
    iconMdi: true,
    hasNotification: notificationState.channel
  },
  {
    type: 'channels',
    iconName: 'hash'
  },
  {
    type: 'activity',
    iconName: 'activity'
  },
  {
    type: 'users',
    iconName: 'user',
    hasNotification: notificationState.dm
  },
  {
    type: 'clips',
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
    iconName: 'phone',
    iconMdi: true,
    colorClaim: (_, common) => common.ui.qall,
    selectOnAdd: true
  },
  draftList: {
    type: 'draftList',
    iconName: 'pencil',
    iconMdi: true
  },
  audioController: {
    type: 'audioController',
    iconName: 'music-note',
    iconMdi: true
  }
}

const useNavigationSelectorEntry = () => {
  const { isCurrentDevice: hasActiveQallSession } = useAppRtcStore()
  const { unreadChannelsMap } = useMeStore()
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const { hasInputChannel } = useMessageInputStateBase()
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
