import {
  provide,
  inject,
  reactive,
  computed,
  InjectionKey,
  Ref,
  unref,
  watch
} from 'vue'
import { AttachmentType, mimeToFileType } from '@/lib/util/file'
import { canResize, resize } from '@/lib/resize'
import { convertToDataUrl } from '@/lib/resize/dataurl'
import { ChannelId } from '@/types/entity-ids'

const IMAGE_SIZE_LIMIT = 20 * 1000 * 1000 // 20MB
const FILE_SIZE_LIMIT = 30 * 1000 * 1000 // 30MB

const tooLargeFileMessage =
  window.traQConfig.tooLargeFileMessage ??
  '大きい%sの共有には別のサービスを利用してください。'

const IMAGE_MAX_SIZE_EXCEEDED_MESSAGE = `画像サイズは20MBまでです\n${tooLargeFileMessage.replace(
  '%s',
  '画像'
)}`
const FILE_MAX_SIZE_EXCEEDED_MESSAGE = `画像サイズは30MBまでです\n${tooLargeFileMessage.replace(
  '%s',
  'ファイル'
)}`

const messageInputStateSymbol: InjectionKey<MessageInputStates> = Symbol()

/**
 * ChannelIdの代わりに一意となるもの
 *
 * share-target: Web Share Target APIで使う画面で利用
 */
const VIRTUAL_IDS = ['share-target'] as const
export type VirtualChannelId = typeof VIRTUAL_IDS[number]
const virtualIds: ReadonlySet<string> = new Set(VIRTUAL_IDS)

type MessageInputStates = Map<ChannelId | VirtualChannelId, MessageInputState>

export interface MessageInputState {
  text: string
  attachments: Attachment[]
}

export type Attachment = {
  file: File
  type: AttachmentType
  thumbnailDataUrl?: string
}

const createMessageInputState = () => {
  return reactive<MessageInputStates>(new Map())
}

export const provideMessageInputState = () => {
  provide(messageInputStateSymbol, createMessageInputState())
}

export const useMessageInputStates = () => {
  const states = inject(messageInputStateSymbol)
  if (!states) {
    throw new Error('useMessageInputState() was called without provider.')
  }

  const inputChannels = computed(() =>
    [...states].filter(([id]) => !virtualIds.has(id))
  )
  const hasInputChannel = computed(() => inputChannels.value.length > 0)

  return { inputChannels, hasInputChannel }
}

export type MessageInputStateKey = Ref<ChannelId> | VirtualChannelId

const useMessageInputStateBase = (channelId: MessageInputStateKey) => {
  const states = inject(messageInputStateSymbol)
  if (!states) {
    throw new Error('useMessageInputState() was called without provider.')
  }

  const getStore = () => states.get(unref(channelId))
  const setStore = (v: MessageInputState) => {
    // 空のときは削除、空でないときはセット
    if (v && (v.text !== '' || v.attachments.length > 0)) {
      // コピーしないと参照が変わらないから上書きされる
      // toRawしちゃうとreactiveで包めなくなるので、そうはしない
      states.set(unref(channelId), { ...v })
    } else {
      states.delete(unref(channelId))
    }
  }

  const state: MessageInputState = reactive(
    getStore() ?? { text: '', attachments: [] }
  )
  watch(
    () => getStore(),
    v => {
      if (v) {
        state.text = v.text
        state.attachments = v.attachments
      } else {
        state.text = ''
        state.attachments = []
      }
    },
    { deep: true }
  )
  watch(
    state,
    v => {
      setStore(v)
    },
    { deep: true }
  )

  return { state }
}

const useMessageInputState = (channelId: MessageInputStateKey) => {
  const { state } = useMessageInputStateBase(channelId)

  const isTextEmpty = computed(() => state.text === '')
  const isAttachmentEmpty = computed(() => state.attachments.length === 0)
  const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

  const addTextToLast = (text: string) => {
    state.text += state.text !== '' ? `\n${text}` : text
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
    clearState
  }
}

export default useMessageInputState

export const getAttachmentFile = async (file: File) => {
  const fileType = mimeToFileType(file.type)

  if (fileType === 'image' && file.size > IMAGE_SIZE_LIMIT) {
    throw new Error(IMAGE_MAX_SIZE_EXCEEDED_MESSAGE)
  }
  if (file.size > FILE_SIZE_LIMIT) {
    throw new Error(FILE_MAX_SIZE_EXCEEDED_MESSAGE)
  }

  if (fileType !== 'image') {
    return file
  }

  const resizable = canResize(file.type)

  if (!resizable) {
    return file
  }

  const res = await resize(file)
  if (res === 'cannot resize') {
    throw new Error('画像が大きいためサムネイルは生成されません')
  }
  if (res === 'error') {
    throw new Error('画像の形式が不正なためサムネイルは生成されません')
  }
  if (!res) {
    return file
  }
  return res
}

export const useMessageInputStateAttachment = (
  channelId: MessageInputStateKey,
  onError: (message: string) => void
) => {
  const { state } = useMessageInputStateBase(channelId)

  const attachments = computed(() => state.attachments)

  const addFromDataTransfer = (dt: DataTransfer) => {
    const types = dt.types
    // iOS Safariでは存在しない
    if (!types) return

    if (types.includes('Files')) {
      Array.from(dt.files).forEach(file => {
        addAttachment(file)
      })
      return
    }
    if (types.includes('text/uri-list')) {
      addTextToLast(dt.getData('text/uri-list'))
      return
    }
    if (types.includes('text/plain')) {
      addTextToLast(dt.getData('text/plain'))
    }
  }

  const addTextToLast = (text: string) => {
    state.text += state.text !== '' ? `\n${text}` : text
  }

  const addAttachment = async (file: File) => {
    try {
      const fileType = mimeToFileType(file.type)
      const attachmentFile = await getAttachmentFile(file)
      if (fileType !== 'image') {
        state.attachments.push({
          type: fileType,
          file: attachmentFile
        })
        return
      }
      const thumbnailDataUrl = await convertToDataUrl(attachmentFile)
      if (!thumbnailDataUrl) return

      state.attachments.push({
        type: fileType,
        file: attachmentFile,
        thumbnailDataUrl
      })
    } catch (e) {
      onError(e)
    }
  }

  const removeAttachmentAt = (index: number) => {
    if (0 <= index && index < state.attachments.length) {
      state.attachments.splice(index, 1)
    }
  }

  return {
    attachments,
    addFromDataTransfer,
    addAttachment,
    removeAttachmentAt
  }
}
