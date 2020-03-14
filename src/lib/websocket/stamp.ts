import apis from '@/lib/api'
import store from '@/store'
import {
  StampCreatedEvent,
  StampUpdatedEvent,
  StampDeletedEvent
} from './events'

export const onStampCreated = async ({ id }: StampCreatedEvent['body']) => {
  const res = await apis.getStamp(id)
  store.commit.entities.addStamp({ id, entity: res.data })
}

export const onStampUpdated = async ({ id }: StampUpdatedEvent['body']) => {
  const res = await apis.getStamp(id)
  store.commit.entities.extendStamps({ [id]: res.data })
}

export const onStampDeleted = ({ id }: StampDeletedEvent['body']) => {
  store.commit.entities.deleteStamp(id)
}
