import { mitt } from '@/lib/typedMitt'
import { Channel } from '@traptitech/traq'

type EntityEventMap = {
  setChannels: () => void
  addChannel: (channel: Channel) => void
  updateChannel: (data: { newChannel: Channel; oldChannel: Channel }) => void
}

export const entityMitt = mitt<EntityEventMap>()
