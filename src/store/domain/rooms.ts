import type {
  Channel,
  QallRoomStateChangedEventRoomStatesInner,
  QallRoomWithParticipants,
  User
} from '@traptitech/traq'

import { readonly, ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { wsListener } from '/@/lib/websocket'

import { useChannelsStore } from '../entities/channels'
import { useUsersStore } from '../entities/users'
import { convertToRefsStore } from '../utils/convertToRefsStore'

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
  const { usersMap, usersMapInitialFetchPromise } = useUsersStore()

  const purifyRoomData = async (
    data:
      QallRoomStateChangedEventRoomStatesInner[] | QallRoomWithParticipants[]
  ): Promise<Rooms> => {
    if (!data) return []
    // 参加者のユーザー情報が引けないと参加者が捨てられてしまうので、
    // チャンネルだけでなくユーザー一覧の初回取得も待つ
    await Promise.all([
      bothChannelsMapInitialFetchPromise,
      usersMapInitialFetchPromise
    ])
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
      await setRooms(data)
    }
    return rooms.value
  }

  // WebSocket のイベントと初回取得の結果が前後しても、新しい方で上書きされるようにする
  let latestUpdateId = 0
  const setRooms = async (
    data:
      QallRoomStateChangedEventRoomStatesInner[] | QallRoomWithParticipants[]
  ) => {
    const updateId = ++latestUpdateId
    const purified = await purifyRoomData(data)
    if (updateId !== latestUpdateId) return
    rooms.value = purified
    roomsFetched.value = true
  }

  wsListener.on('QALL_ROOM_STATE_CHANGED', async ({ roomStates }) => {
    await setRooms(roomStates)
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
