import type {
  Channel,
  DMChannel,
  Stamp,
  User,
  UserGroup
} from '@traptitech/traq'

import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

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
  const bothChannelsMapFetched = ref(true)

  return {
    useChannelsStore: () => ({
      channelsMap,
      dmChannelsMap,
      userIdToDmChannelIdMap,
      bothChannelsMapFetched
    })
  }
})

vi.mock('/@/store/entities/stamps', async () => {
  const { ref } = await import('vue')
  const stampsMap = ref(new Map<string, Stamp>())
  return { useStampsStore: () => ({ stampsMap }) }
})

vi.mock('/@/store/domain/channelTree', async () => {
  const { computed } = await import('vue')
  const { constructTree, rootChannelId } = await import('/@/lib/channelTree')
  const { useChannelsStore } = await import('/@/store/entities/channels')
  const topLevelChannels = computed(() =>
    [...useChannelsStore().channelsMap.value.values()].filter(
      channel => channel.parentId === null
    )
  )
  const channelTree = computed(() => ({
    children:
      constructTree(
        {
          id: rootChannelId,
          name: '',
          parentId: null,
          archived: false,
          children: topLevelChannels.value.map(channel => channel.id)
        },
        useChannelsStore().channelsMap.value
      )?.children ?? []
  }))

  return { useChannelTree: () => ({ channelTree, topLevelChannels }) }
})

export const resetReferenceEntities = () => {
  useUsersStore().usersMap.value = new Map()
  useGroupsStore().userGroupsMap.value = new Map()
  useStampsStore().stampsMap.value = new Map()
  const channels = useChannelsStore()
  channels.channelsMap.value = new Map()
  channels.dmChannelsMap.value = new Map()
  channels.userIdToDmChannelIdMap.value.clear()
  channels.bothChannelsMapFetched.value = true
}
