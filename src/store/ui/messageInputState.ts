import { defineStore, acceptHMRUpdate } from 'pinia'
import { reactive, computed, Ref, unref, watch } from 'vue'
import { AttachmentType, mimeToFileType } from '/@/lib/basic/file'
import { generateMarkdownFromHtml } from '/@/lib/markdown/fromHtml'
import { getResizedFile } from '/@/lib/resize'
import { convertToDataUrl } from '/@/lib/resize/dataurl'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { ChannelId } from '/@/types/entity-ids'

/**
 * ChannelIdの代わりに一意となるもの
 *
 * share-target: Web Share Target APIで使う画面で利用
 */
const VIRTUAL_IDS = ['share-target'] as const
export type VirtualChannelId = typeof VIRTUAL_IDS[number]
const virtualIds: ReadonlySet<string> = new Set(VIRTUAL_IDS)

export interface MessageInputState {
  text: string
  attachments: Attachment[]
}

export type Attachment = {
  file: File
  type: AttachmentType
  thumbnailDataUrl?: string
}

export type MessageInputStateKey = Ref<ChannelId> | ChannelId | VirtualChannelId

const createDefaultValue = () => ({ text: '', attachments: [] })

const useMessageInputStatePinia = defineStore('ui/messageInputState', () => {
  const states = reactive(
    new Map<ChannelId | VirtualChannelId, MessageInputState>()
  )

  const inputChannels = computed(() =>
    [...states].filter(([id]) => !virtualIds.has(id))
  )
  const hasInputChannel = computed(() => inputChannels.value.length > 0)

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

  return { inputChannels, hasInputChannel, getStore, setStore }
})

// TODO: 命名規則から外れているのを直す
export const useMessageInputStateBase = convertToRefsStore(
  useMessageInputStatePinia
)

const useMessageInputStateIndividual = (channelId: MessageInputStateKey) => {
  const { getStore, setStore } = useMessageInputStateBase()

  const state: MessageInputState = reactive(
    getStore(channelId) ?? createDefaultValue()
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

export const useMessageInputState = (channelId: MessageInputStateKey) => {
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

export const useMessageInputStateStatic = () => {
  const { getStore, setStore } = useMessageInputStateBase()

  /**
   * リアクティブでない値を返す(channelIdや入力状態が変化しても返り値が変化しない)
   */
  const getMessageInputState = (channelId: MessageInputStateKey) => {
    const cId = unref(channelId)
    const state = getStore(cId) ?? createDefaultValue()

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

const removeSpaces = (text: string) => text.replace(/\s|\\/g, '')

export const useMessageInputStateAttachment = (
  channelId: MessageInputStateKey,
  onError: (message: string) => void
) => {
  const { state } = useMessageInputStateIndividual(channelId)

  const attachments = computed(() => state.attachments)

  const getTextFromHtml = async (dt: DataTransfer, eventToPrevent?: Event) => {
    eventToPrevent?.preventDefault()

    const html = dt.getData('text/html')
    const plainText = dt.getData('text/plain')
    const markdown = await generateMarkdownFromHtml(html)

    const isSame = removeSpaces(markdown) === removeSpaces(plainText)
    if (isSame) {
      return plainText
    }

    if (confirm('HTMLをマークダウンに変換して貼り付けますか？')) {
      return markdown
    }
    return plainText
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
        const url = dt.getData('text/uri-list')

        // もし、ファイル数が1件ならショートカットファイルから名前を抽出して利用する
        if (dt.files.length === 1 && dt.files[0]?.name) {
          const name = dt.files[0].name.replace(/\.url$/, '')
          addTextToLast(`[${name}](${url})`)
          return
        }
        addTextToLast(url)
        return
      }
    }

    if (types.includes('Files')) {
      ;[...dt.files].forEach(file => {
        addAttachment(file)
      })
      return
    }

    if (types.includes('text/html')) {
      const text = await getTextFromHtml(dt)
      addTextToLast(text)
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
    getTextFromHtml,
    addFromDataTransfer,
    addAttachment,
    removeAttachmentAt
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMessageInputStatePinia, import.meta.hot)
  )
}
