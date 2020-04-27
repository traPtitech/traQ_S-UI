import {
  ClipFolderCreatedEvent,
  ClipFolderUpdatedEvent,
  ClipFolderDeletedEvent,
  ClipFolderMessageAddedEvent,
  ClipFolderMessageDeletedEvent
} from './events'
import apis from '@/lib/apis'
import store from '@/store'

export const onClipFolderCreated = async (
  data: ClipFolderCreatedEvent['body']
) => {
  const res = await apis.getClipFolder(data.id)
  store.commit.entities.addClipFolder({ id: data.id, entity: res.data })
}

export const onClipFolderUpdated = async (
  data: ClipFolderUpdatedEvent['body']
) => {
  const res = await apis.getClipFolder(data.id)
  store.commit.entities.extendClipFolder({ [data.id]: res.data })
}

export const onClipFolderDeleted = (data: ClipFolderDeletedEvent['body']) => {
  store.commit.entities.deleteClipFolder(data.id)
}

export const onClipFolderMessageAdded = async (
  data: ClipFolderMessageAddedEvent['body']
) => {
  const currentPrimaryView = store.state.ui.mainView.primaryView
  if (
    currentPrimaryView.type !== 'clips' ||
    currentPrimaryView.clipFolderId !== data.folder_id
  ) {
    return
  }
  const res = await apis.getMessage(data.message_id)
  store.commit.entities.addMessage({ id: data.message_id, entity: res.data })
  await store.dispatch.domain.messagesView.addAndRenderMessage({
    message: res.data
  })
}

export const onClipFolderMessageDeleted = (
  data: ClipFolderMessageDeletedEvent['body']
) => {
  const currentPrimaryView = store.state.ui.mainView.primaryView
  if (
    currentPrimaryView.type !== 'clips' ||
    currentPrimaryView.clipFolderId !== data.folder_id
  ) {
    return
  }
  store.commit.entities.deleteMessage(data.message_id)
  store.commit.domain.messagesView.deleteMessageId(data.message_id)
}
