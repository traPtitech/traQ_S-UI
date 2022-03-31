import { defineStore, acceptHMRUpdate } from 'pinia'
import { reactive, computed, Ref, unref, watch } from 'vue'
import { AttachmentType, mimeToFileType } from '/@/lib/basic/file'
import { getResizedFile } from '/@/lib/resize'
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

export const useMessageInputStateAttachment = (
  channelId: MessageInputStateKey,
  onError: (message: string) => void
) => {
  const { state } = useMessageInputStateIndividual(channelId)

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
    addTextToLast,
    addAttachment,
    removeAttachmentAt
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMessageInputStatePinia, import.meta.hot)
  )
}
