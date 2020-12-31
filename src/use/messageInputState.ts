import { provide, inject, reactive, computed } from 'vue'
import { AttachmentType, mimeToFileType } from '@/lib/util/file'
import config from '@/config'
import { canResize, resize } from '@/lib/resize'
import { convertToDataUrl } from '@/lib/resize/dataurl'

const IMAGE_SIZE_LIMIT = 20 * 1000 * 1000 // 20MB
const FILE_SIZE_LIMIT = 30 * 1000 * 1000 // 30MB

const IMAGE_MAX_SIZE_EXCEEDED_MESSAGE = `画像サイズは20MBまでです\n${config.tooLargeFileMessage.replace(
  '%s',
  '画像'
)}`
const FILE_MAX_SIZE_EXCEEDED_MESSAGE = `画像サイズは30MBまでです\n${config.tooLargeFileMessage.replace(
  '%s',
  'ファイル'
)}`

const MessageInputStateSymbol = Symbol()

interface MessageInputState {
  text: string
  attachments: Attachment[]
}

export type Attachment = {
  file: File
  type: AttachmentType
  thumbnailDataUrl?: string
}

const createMessageInputState = () => {
  return reactive<MessageInputState>({
    text: '',
    attachments: []
  })
}

export const provideMessageInputState = () => {
  provide(MessageInputStateSymbol, createMessageInputState())
}

const useMessageInputState = () => {
  const state = inject<MessageInputState>(MessageInputStateSymbol)
  if (!state) {
    throw new Error('useMessageInputState() was called without provider.')
  }

  const isTextEmpty = computed(() => state.text === '')
  const isAttachmentEmpty = computed(() => state.attachments.length === 0)
  const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

  const addAttachment = async (file: File) => {
    const fileType = mimeToFileType(file.type)

    if (fileType === 'image' && file.size > IMAGE_SIZE_LIMIT) {
      window.alert(IMAGE_MAX_SIZE_EXCEEDED_MESSAGE)
      return
    }
    if (file.size > FILE_SIZE_LIMIT) {
      window.alert(FILE_MAX_SIZE_EXCEEDED_MESSAGE)
      return
    }

    if (fileType !== 'image') {
      state.attachments.push({
        type: fileType,
        file
      })
      return
    }

    const resizable = canResize(file.type)

    let resizedFile = file
    if (resizable) {
      resizedFile = (await resize(file)) ?? file
    }

    const thumbnailDataUrl = await convertToDataUrl(resizedFile)
    if (!thumbnailDataUrl) return

    state.attachments.push({
      type: fileType,
      file: resizedFile,
      thumbnailDataUrl
    })
  }

  const removeAttachmentAt = (index: number) => {
    if (0 <= index && index < state.attachments.length) {
      state.attachments.splice(index, 1)
    }
  }

  const clearState = () => {
    state.text = ''
    state.attachments = []
  }

  return {
    state,
    isTextEmpty,
    isAttachmentEmpty,
    isEmpty,
    addAttachment,
    removeAttachmentAt,
    clearState
  }
}

export default useMessageInputState
