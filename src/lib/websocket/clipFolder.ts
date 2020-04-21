/* eslint-disable no-console */
import {
  ClipFolderCreatedEvent,
  ClipFolderUpdatedEvent,
  ClipFolderDeletedEvent,
  ClipFolderMessageAddedEvent,
  ClipFolderMessageDeletedEvent
} from './events'

export const onClipFolderCreated = (data: ClipFolderCreatedEvent['body']) => {
  console.error('onClipFolderCreated: Not implemented')
}

export const onClipFolderUpdated = (data: ClipFolderUpdatedEvent['body']) => {
  console.error('onClipFolderUpdated: Not implemented')
}

export const onClipFolderDeleted = (data: ClipFolderDeletedEvent['body']) => {
  console.error('onClipFolderDeleted: Not implemented')
}

export const onClipFolderMessageAdded = (
  data: ClipFolderMessageAddedEvent['body']
) => {
  console.error('onClipFolderMessageAdded: Not implemented')
}

export const onClipFolderMessageDeleted = (
  data: ClipFolderMessageDeletedEvent['body']
) => {
  console.error('onClipFolderMessageDeleted: Not implemented')
}
