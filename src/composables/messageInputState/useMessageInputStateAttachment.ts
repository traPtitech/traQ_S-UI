import { computed } from 'vue'
import useMessageInputState from './useMessageInputState'
import { mimeToFileType } from '/@/lib/basic/file'
import { getResizedFile } from '/@/lib/resize'
import type { MessageInputStateKey } from '/@/store/ui/messageInputStateStore'

const useMessageInputStateAttachment = (
  channelId: MessageInputStateKey,
  onError: (message: string) => void
) => {
  const { state } = useMessageInputState(channelId)

  const attachments = computed(() => state.attachments)

  const addTextToLast = (text: string) => {
    state.text += state.text !== '' ? `\n${text}` : text
  }

  const addAttachment = async (file: File) => {
    try {
      const fileType = mimeToFileType(file.type)
      const attachmentFile = await getResizedFile(file)
      state.attachments.push({
        type: fileType,
        file: attachmentFile
      })
    } catch (e) {
      if (e instanceof Error) {
        onError(e.message)
      } else {
        onError('ファイルの処理に失敗しました')
      }
    }
  }

  const removeAttachmentAt = (index: number) => {
    if (0 <= index && index < state.attachments.length) {
      state.attachments.splice(index, 1)
    }
  }

  return {
    attachments,
    addTextToLast,
    addAttachment,
    removeAttachmentAt
  }
}

export default useMessageInputStateAttachment
