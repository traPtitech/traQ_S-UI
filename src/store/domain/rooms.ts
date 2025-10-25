import type {
  Channel,
  QallRoomStateChangedEventRoomStatesInner,
  QallRoomWithParticipants,
  User
} from '@traptitech/traq'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref } from 'vue'
import { createSingleflight } from '/@/lib/basic/async'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '../utils/convertToRefsStore'
import { useChannelsStore } from '../entities/channels'
import { useUsersStore } from '../entities/users'

type Participant = {
  user: User
  joinedAt: string
  canPublish: boolean
  attributes: { [key: string]: string }
}
type Room = {
  channel: Channel
  participants: Participant[]
  isWebinar: boolean
}
type Rooms = Room[]

const getRooms = createSingleflight(
  (...args: Parameters<typeof apis.getRooms>) => apis.getRooms(...args)
)

const useRoomsStorePinia = defineStore('domain/rooms', () => {
  const rooms = ref<Rooms>([])
  const roomsFetched = ref(false)

  const { channelsMap, bothChannelsMapInitialFetchPromise } = useChannelsStore()
  const { usersMap } = useUsersStore()

  const purifyRoomData = async (
    data:
      | QallRoomStateChangedEventRoomStatesInner[]
      | QallRoomWithParticipants[]
  ): Promise<Rooms> => {
    if (!data) return []
    await bothChannelsMapInitialFetchPromise.value
    return data
      .filter(room => room.participants && room.participants.length > 0)
      .map(room => {
        return {
          channel: channelsMap.value.get(room.roomId),
          participants:
            room.participants
              ?.map(p => ({
                joinedAt: p.joinedAt,
                user:
                  p.identity && usersMap.value.get(p.identity.slice(0, -37)),
                canPublish: p.canPublish,
                attributes: p.attributes
              }))
              .filter((p): p is Participant => !!p.user) ?? [],
          isWebinar: room.isWebinar
        }
      })
      .filter((room): room is Room => {
        if (!room.channel) return false
        return !room.channel.archived
      })
  }

  const fetchRooms = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}): Promise<Rooms> => {
    if (roomsFetched.value && !ignoreCache) {
      return rooms.value
    }

    const [{ data }, shared] = await getRooms()
    if (!shared) {
      rooms.value = await purifyRoomData(data)
      roomsFetched.value = true
    }
    return rooms.value
  }

  wsListener.on('QALL_ROOM_STATE_CHANGED', async ({ roomStates }) => {
    rooms.value = await purifyRoomData(roomStates)
  })

  wsListener.on('reconnect', () => {
    fetchRooms({ ignoreCache: true })
  })

  return {
    rooms: readonly(rooms),
    fetchRooms
  }
})

export const useRoomsStore = convertToRefsStore(useRoomsStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoomsStorePinia, import.meta.hot))
}
