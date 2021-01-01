import { mitt } from '@/lib/typedMitt'
import { StampId } from '@/types/entity-ids'
import { Channel, Stamp } from '@traptitech/traq'

type EntityEventMap = {
  setChannels: () => void
  addChannel: (channel: Channel) => void
  updateChannel: (data: {
    newChannel: Channel
    oldChannel: Channel
    oldPath: string
  }) => void

  setStamps: () => void
  setStamp: (stamp: Stamp) => void
  deleteStamp: (stampId: StampId) => void
}

export const entityMitt = mitt<EntityEventMap>()
