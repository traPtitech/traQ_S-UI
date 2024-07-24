import type { MessageStamp } from '@traptitech/traq'
import type { StampId, UserId } from '/@/types/entity-ids'

/**
 * ユーザー、そのユーザーの押した数と最初に押した時間
 */
export interface StampUser {
  id: UserId
  count: number
  createdAt: Date
}

/**
 * StampIdで整理されたMessageStamp
 */
export interface MessageStampById {
  /**
   * スタンプID
   */
  id: StampId
  /**
   * 押した数の累計
   */
  sum: number
  /**
   * 自分の押した数
   */
  myCount: number
  /**
   * ユーザー、そのユーザーの押した数と最初に押した時間
   */
  users: Array<StampUser>
  /**
   * 一番最初に押された時間
   */
  createdAt: Date
  /**
   * 一番最後に押された時間
   */
  updatedAt: Date
}

export const createStampList = (
  stamps: MessageStamp[],
  myId: UserId | undefined
) => {
  const map = new Map<StampId, MessageStampById>()

  for (const stamp of stamps) {
    if (!map.has(stamp.stampId)) {
      map.set(stamp.stampId, {
        id: stamp.stampId,
        sum: stamp.count,
        myCount: stamp.userId === myId ? stamp.count : 0,
        users: [
          {
            id: stamp.userId,
            count: stamp.count,
            createdAt: new Date(stamp.createdAt)
          }
        ],
        createdAt: new Date(stamp.createdAt),
        updatedAt: new Date(stamp.updatedAt)
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const s = map.get(stamp.stampId)!
      s.sum += stamp.count
      s.users.push({
        id: stamp.userId,
        count: stamp.count,
        createdAt: new Date(stamp.createdAt)
      })
      if (stamp.userId === myId) {
        s.myCount = stamp.count
      }
      const createdAt = new Date(stamp.createdAt)
      if (createdAt < s.createdAt) {
        s.createdAt = createdAt
      }
      const updatedAt = new Date(stamp.updatedAt)
      if (s.updatedAt < updatedAt) {
        s.updatedAt = updatedAt
      }
    }
  }

  for (const stamp of map.values()) {
    stamp.users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  return [...map.values()].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )
}
