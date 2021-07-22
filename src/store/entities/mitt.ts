import { mitt } from '/@/lib/typedMitt'
import { StampId } from '/@/types/entity-ids'
import { Channel, Stamp } from '@traptitech/traq'

/**
 * addChannelイベントにaction時の情報が必要なため、
 * すべてaction側で発火することにしている
 */
export type EntityEventMap = {
  setUser: () => void
  setUsers: () => void
  deleteUser: () => void

  setUserGroup: () => void
  setUserGroups: () => void
  deleteUserGroup: () => void

  setChannels: () => void
  addChannel: (channel: Channel) => void
  updateChannel: (data: {
    newChannel: Channel
    oldChannel: Channel
    oldPath: string
  }) => void

  setStamp: (stamp: Stamp) => void
  setStamps: () => void
  deleteStamp: (stampId: StampId) => void
}

/**
 * 循環参照回避のためindex.tsではなくこのファイルに分離
 */
export const entityMitt = mitt<EntityEventMap>()
