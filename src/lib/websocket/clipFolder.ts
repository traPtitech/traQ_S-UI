import {
  ClipFolderMessageAddedEvent,
  ClipFolderMessageDeletedEvent
} from './events'
import apis from '@/lib/apis'
import store from '@/_store'

export const onClipFolderMessageAdded = async (
  data: ClipFolderMessageAddedEvent
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
  data: ClipFolderMessageDeletedEvent
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
