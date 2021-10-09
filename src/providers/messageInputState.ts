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
import { AttachmentType, mimeToFileType } from '/@/lib/util/file'
import { getResizedFile } from '/@/lib/resize'
import { convertToDataUrl } from '/@/lib/resize/dataurl'
import { ChannelId } from '/@/types/entity-ids'
import { generateMarkdownFromHtml } from '/@/lib/markdown/fromHtml'

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

export type MessageInputStateKey = Ref<ChannelId> | ChannelId | VirtualChannelId

const useMessageInputStateBase = () => {
  const states = inject(messageInputStateSymbol)
  if (!states) {
    throw new Error('useMessageInputState() was called without provider.')
  }

  const getStore = (cId: MessageInputStateKey) => states.get(unref(cId))
  const setStore = (cId: MessageInputStateKey, v: MessageInputState) => {
    // 空のときは削除、空でないときはセット
    if (v && (v.text !== '' || v.attachments.length > 0)) {
      // コピーしないと参照が変わらないから上書きされる
      // toRawしちゃうとreactiveで包めなくなるので、そうはしない
      states.set(unref(cId), { ...v })
    } else {
      states.delete(unref(cId))
    }
  }

  const defaultValue = { text: '', attachments: [] }

  return { getStore, setStore, defaultValue }
}

const useMessageInputStateIndividual = (channelId: MessageInputStateKey) => {
  const { getStore, setStore, defaultValue } = useMessageInputStateBase()

  const state: MessageInputState = reactive(
    getStore(channelId) ?? { ...defaultValue }
  )
  watch(
    () => getStore(channelId),
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
      setStore(channelId, v)
    },
    { deep: true }
  )

  return { state }
}

const useMessageInputState = (channelId: MessageInputStateKey) => {
  const { state } = useMessageInputStateIndividual(channelId)

  const isTextEmpty = computed(() => state.text === '')
  const isAttachmentEmpty = computed(() => state.attachments.length === 0)
  const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

  return {
    state,
    isTextEmpty,
    isAttachmentEmpty,
    isEmpty
  }
}

export default useMessageInputState

export const useMessageInputStateStatic = () => {
  const { getStore, setStore, defaultValue } = useMessageInputStateBase()

  /**
   * リアクティブでない値を返す(channelIdや入力状態が変化しても返り値が変化しない)
   */
  const getMessageInputState = (channelId: MessageInputStateKey) => {
    const cId = unref(channelId)
    const state = getStore(cId) ?? { ...defaultValue }

    const isTextEmpty = computed(() => state.text === '')
    const isAttachmentEmpty = computed(() => state.attachments.length === 0)
    const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

    const clearState = () => {
      state.text = ''
      state.attachments = []
      setStore(cId, state)
    }

    return {
      state,
      isTextEmpty,
      isAttachmentEmpty,
      isEmpty,
      clearState
    }
  }

  return { getMessageInputState }
}

export const useMessageInputStateAttachment = (
  channelId: MessageInputStateKey,
  onError: (message: string) => void
) => {
  const { state } = useMessageInputStateIndividual(channelId)

  const attachments = computed(() => state.attachments)

  const addMarkdownGeneratedFromHtml = async (
    dt: DataTransfer,
    eventToPrevent?: Event
  ) => {
    const html = dt.getData('text/html')
    if (html && confirm('HTMLをマークダウンに変換して貼り付けますか？')) {
      eventToPrevent?.preventDefault()

      const markdown = await generateMarkdownFromHtml(html)
      addTextToLast(markdown)
      return true
    }
    return false
  }

  const addFromDataTransfer = async (dt: DataTransfer) => {
    const types = dt.types
    // iOS Safariでは存在しない
    if (!types) return

    // chromeだとtext/uri-listならショートカットのファイルが含まれるので、
    // typeが指定されているファイルしか存在しないときはtext/uri-listを優先する
    // typeが指定されているファイルが存在する場合は、
    // 例えばブラウザ上の画像をドラッグドロップしたときに発生する
    if (types.includes('text/uri-list')) {
      const hasOnlyNonTypedFiles = [...dt.files].every(file => file.type === '')

      if (hasOnlyNonTypedFiles) {
        addTextToLast(dt.getData('text/uri-list'))
        return
      }
    }

    if (types.includes('Files')) {
      ;[...dt.files].forEach(file => {
        addAttachment(file)
      })
      return
    }

    const added = await addMarkdownGeneratedFromHtml(dt)
    if (added) {
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
      const attachmentFile = await getResizedFile(file)
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
      if (typeof e === 'string') {
        onError(e)
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
    addMarkdownGeneratedFromHtml,
    addFromDataTransfer,
    addAttachment,
    removeAttachmentAt
  }
}
