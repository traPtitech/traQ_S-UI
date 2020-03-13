import { StampId } from '@/types/entity-ids'
import apis from '@/lib/api'
import store from '@/store'

interface StampIdBody {
  id: StampId
}

export interface StampCreatedEvent {
  type: 'STAMP_CREATED'
  body: StampIdBody
}
export const onStampCreated = async ({ id }: StampCreatedEvent['body']) => {
  const res = await apis.getStamp(id)
  store.commit.entities.addStamp({ id, entity: res.data })
}

export interface StampUpdatedEvent {
  type: 'STAMP_UPDATED'
  body: StampIdBody
}
export const onStampUpdated = async ({ id }: StampUpdatedEvent['body']) => {
  const res = await apis.getStamp(id)
  store.commit.entities.extendStamps({ [id]: res.data })
}

export interface StampDeletedEvent {
  type: 'STAMP_DELETED'
  body: StampIdBody
}
export const onStampDeleted = ({ id }: StampDeletedEvent['body']) => {
  store.commit.entities.deleteStamp(id)
}
