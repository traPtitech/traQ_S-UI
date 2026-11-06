import type { Ref } from 'vue'
import { computed, onScopeDispose, ref, watch } from 'vue'

import useAttachmentPicker from '/@/components/Main/MainView/MessageInput/composables/useAttachmentPicker'
import apis, { formatResizeError } from '/@/lib/apis'
import { countLength } from '/@/lib/basic/string'
import { normalizeMessageSource } from '/@/lib/message/content'
import { uploadAttachments } from '/@/lib/message/uploadAttachments'
import { getResizedFile } from '/@/lib/resize'
import { MESSAGE_MAX_LENGTH } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'

type EditorOperation = Ref<'saving' | 'uploading' | undefined>
type CaptureSession = () => () => boolean

const useEditMessage = (
  props: { messageId: string },
  text: Ref<string>,
  emit: (e: 'finishEditing') => void,
  operation: EditorOperation,
  captureSession: CaptureSession
) => {
  const { addErrorToast } = useToastStore()

  const editMessage = async () => {
    if (operation.value) return
    const isCurrent = captureSession()
    const messageId = props.messageId
    const content = normalizeMessageSource(text.value)

    if (countLength(content) > MESSAGE_MAX_LENGTH) {
      addErrorToast('メッセージが長すぎます')

      return
    }

    operation.value = 'saving'

    try {
      await apis.editMessage(messageId, {
        content
      })

      if (isCurrent()) emit('finishEditing')
    } catch {
      if (isCurrent()) addErrorToast('メッセージの編集に失敗しました')
    } finally {
      if (isCurrent()) operation.value = undefined
    }
  }

  const cancel = () => {
    emit('finishEditing')
  }

  return { editMessage, cancel }
}

const useAttachmentsEditor = (
  props: { channelId: string; messageId: string },
  text: Ref<string>,
  operation: EditorOperation,
  captureSession: CaptureSession
) => {
  const { addErrorToast } = useToastStore()

  const isPosting = computed(() => operation.value === 'uploading')
  const progress = ref(0)

  watch(
    () => props.messageId,
    () => {
      progress.value = 0
    }
  )

  const captureAttachments = () => {
    const isCurrent = captureSession()
    const channelId = props.channelId

    return async (pendingFiles: File[] | Promise<File[]>) => {
      const files = await pendingFiles
      if (!files.length || operation.value || !isCurrent()) return
      operation.value = 'uploading'

      try {
        for (const file of files) {
          const attachmentFile = await getResizedFile(file)
          if (!isCurrent()) return

          const [fileUrl] = await uploadAttachments(
            [attachmentFile],
            channelId,
            value => {
              if (isCurrent()) progress.value = value
            }
          )
          if (!isCurrent()) return

          if (fileUrl)
            text.value =
              text.value !== '' ? `${text.value}\n${fileUrl}` : fileUrl
        }
      } catch (error) {
        if (isCurrent())
          addErrorToast(
            formatResizeError(error, 'ファイルのアップロードに失敗しました')
          )
      } finally {
        if (isCurrent()) {
          progress.value = 0
          operation.value = undefined
        }
      }
    }
  }

  const { openAttachmentPicker } = useAttachmentPicker(captureAttachments)
  const onAddAttachments = (files: File[] | Promise<File[]>) =>
    captureAttachments()(files)

  return {
    isPostingAttachment: isPosting,
    attachmentPostProgress: progress,
    onAddAttachments,
    openAttachmentPicker
  }
}

export const useMessageEditing = (
  props: { messageId: string; channelId: string },
  text: Ref<string>,
  emit: (e: 'finishEditing') => void
) => {
  const operation = ref<'saving' | 'uploading'>()
  let generation = 0

  watch(
    () => props.messageId,
    () => {
      generation++
      operation.value = undefined
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => generation++)

  const captureSession: CaptureSession = () => {
    const current = generation
    return () => current === generation
  }

  return {
    isBusy: computed(() => operation.value !== undefined),
    ...useEditMessage(props, text, emit, operation, captureSession),
    ...useAttachmentsEditor(props, text, operation, captureSession)
  }
}
