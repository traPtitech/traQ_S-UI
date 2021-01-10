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
import config from '@/config'
import { canResize, resize } from '@/lib/resize'
import { convertToDataUrl } from '@/lib/resize/dataurl'
import { ChannelId } from '@/types/entity-ids'

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

const useMessageInputState = (channelId: MessageInputStateKey) => {
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

  const isTextEmpty = computed(() => state.text === '')
  const isAttachmentEmpty = computed(() => state.attachments.length === 0)
  const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

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
    addFromDataTransfer,
    addAttachment,
    removeAttachmentAt,
    clearState
  }
}

export default useMessageInputState
