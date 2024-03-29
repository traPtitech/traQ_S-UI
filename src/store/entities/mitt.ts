import mitt from 'mitt'
import type { StampId } from '/@/types/entity-ids'
import type { Channel, Stamp } from '@traptitech/traq'

export type EntityEventMap = {
  setUser: void
  setUsers: void
  deleteUser: void

  setUserGroup: void
  setUserGroups: void
  deleteUserGroup: void

  setChannels: void
  addChannel: Channel
  updateChannel: {
    newChannel: Channel
    oldChannel: Channel
    oldPath: string
  }

  setStamp: Stamp
  setStamps: void
  deleteStamp: StampId
}

export const entityMitt = mitt<EntityEventMap>()
