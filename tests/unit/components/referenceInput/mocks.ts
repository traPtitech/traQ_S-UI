import type {
  Channel,
  DMChannel,
  Stamp,
  User,
  UserGroup
} from '@traptitech/traq'

vi.mock('/@/store/app/commandPalette', async () => {
  const { computed, ref } = await import('vue')
  const presentation = ref<{ mode: string; focusTarget: string }>()
  const currentInput = ref('')
  const query = ref('')

  return {
    useCommandPalette: () => ({
      presentation,
      currentInput,
      query,
      isCommandPaletteShown: computed(() => !!presentation.value),

      closeCommandPalette: () => {
        presentation.value = undefined
      },

      settleQuery: vi.fn()
    })
  }
})

vi.mock('/@/store/ui/modal', async () => {
  const { ref } = await import('vue')

  return { useModalStore: () => ({ shouldShowModal: ref(false) }) }
})

vi.mock('/@/composables/useResponsive', async () => {
  const { ref } = await import('vue')

  return { default: () => ({ isMobile: ref(false) }) }
})

vi.mock('/@/store/app/browserSettings', async () => {
  const { ref } = await import('vue')
  const sendWithModifierKey = ref('none')

  const modifierKey = ref({
    ctrl: true,
    alt: false,
    shift: true,
    macCtrl: false
  })

  return { useBrowserSettings: () => ({ sendWithModifierKey, modifierKey }) }
})

vi.mock('/@/store/entities/users', async () => {
  const { ref } = await import('vue')
  const usersMap = ref(new Map<string, User>())

  return { useUsersStore: () => ({ usersMap }) }
})

vi.mock('/@/store/entities/groups', async () => {
  const { ref } = await import('vue')

  const userGroupsMap = ref(new Map<string, UserGroup>())
  return { useGroupsStore: () => ({ userGroupsMap }) }
})

vi.mock('/@/store/entities/channels', async () => {
  const { ref } = await import('vue')
  const channelsMap = ref(new Map<string, Channel>())
  const dmChannelsMap = ref(new Map<string, DMChannel>())
  const userIdToDmChannelIdMap = ref(new Map<string, string>())

  return {
    useChannelsStore: () => ({
      channelsMap,
      dmChannelsMap,
      userIdToDmChannelIdMap
    })
  }
})

vi.mock('/@/composables/useChannelPath', async () => {
  const { channelIdToPathString } = await import('/@/lib/channel')
  const { useChannelsStore } = await import('/@/store/entities/channels')

  return {
    default: () => ({
      channelIdToPathString: (id: string) =>
        '#' + channelIdToPathString(id, useChannelsStore().channelsMap.value),

      channelPathStringToId: (path: string) => {
        const channels = useChannelsStore().channelsMap.value

        return [...channels.keys()].find(
          id => channelIdToPathString(id, channels) === path
        )
      }
    })
  }
})

vi.mock('/@/store/domain/stampHistory', () => ({
  useStampHistory: () => ({ upsertLocalStampHistory: vi.fn() })
}))

vi.mock('/@/store/domain/stampRecommendations', () => ({
  useStampRecommendations: () => ({ recordStampUsage: vi.fn() })
}))

vi.mock('/@/store/entities/stamps', async () => {
  const { ref } = await import('vue')
  const stampsMap = ref(new Map<string, Stamp>())
  return { useStampsStore: () => ({ stampsMap }) }
})
