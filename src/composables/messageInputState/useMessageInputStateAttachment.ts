import { computed, unref } from 'vue'

import { mimeToFileType } from '/@/lib/basic/file'
import { getResizedFile } from '/@/lib/resize'
import type { MessageInputStateKey } from '/@/store/ui/messageInputStateStore'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

import useMessageInputState from './useMessageInputState'

const useMessageInputStateAttachment = (
  channelId: MessageInputStateKey,
  onError: (message: string) => void
) => {
  const { state } = useMessageInputState(channelId)
  const { updateDraft } = useMessageInputStateStore()

  const attachments = computed(() => state.attachments)

  const captureDraft = () => {
    const key = unref(channelId)

    const update = (apply: Parameters<typeof updateDraft>[1]) =>
      updateDraft(key, apply)

    const addTextToLast = (text: string) =>
      update(draft => {
        draft.text += draft.text !== '' ? `\n${text}` : text
      })

    const addAttachment = async (file: File) => {
      try {
        const fileType = mimeToFileType(file.type)
        const attachmentFile = await getResizedFile(file)
        update(draft =>
          draft.attachments.push({
            type: fileType,
            file: attachmentFile
          })
        )
      } catch (e) {
        if (e instanceof Error) {
          onError(e.message)
        } else {
          onError('ファイルの処理に失敗しました')
        }
      }
    }

    const addAttachments = async (files: File[] | Promise<File[]>) => {
      for (const file of await files) await addAttachment(file)
    }

    return { addTextToLast, addAttachment, addAttachments }
  }

  const addTextToLast = (text: string) => captureDraft().addTextToLast(text)
  const addAttachment = (file: File) => captureDraft().addAttachment(file)
  const addAttachments = (files: File[] | Promise<File[]>) =>
    captureDraft().addAttachments(files)

  const removeAttachmentAt = (index: number) => {
    if (0 <= index && index < state.attachments.length) {
      updateDraft(channelId, draft => {
        draft.attachments.splice(index, 1)
      })
    }
  }

  return {
    attachments,
    captureDraft,
    addTextToLast,
    addAttachment,
    addAttachments,
    removeAttachmentAt
  }
}

export default useMessageInputStateAttachment
