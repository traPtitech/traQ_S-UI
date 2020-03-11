import { StampId } from '@/types/entity-ids'

export interface StampCreatedEvent {
  type: 'STAMP_CREATED'
  body: {
    id: StampId
  }
}
export const onStampCreated = (data: StampCreatedEvent['body']) => {}

export interface StampModifiedEvent {
  type: 'STAMP_MODIFIED'
  body: {
    id: StampId
  }
}
export const onStampModified = (data: StampModifiedEvent['body']) => {}
// "id": ev.Fields["stamp_id"].(uuid.UUID),

export interface StampDeletedEvent {
  type: 'STAMP_DELETED'
  body: {
    id: StampId
  }
}
export const onStampDeleted = (data: StampDeletedEvent['body']) => {}

/*
      FAVORITE_STAMP_ADDED
        "id": ev.Fields["stamp_id"].(uuid.UUID),
      FAVORITE_STAMP_REMOVED
        "id": ev.Fields["stamp_id"].(uuid.UUID),
*/
