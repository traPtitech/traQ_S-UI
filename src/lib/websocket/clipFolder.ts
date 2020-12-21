import { ClipFolderMessageDeletedEvent } from './events'
import store from '@/_store'

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
  store.commit.domain.messagesView.deleteMessageId(data.message_id)
}
