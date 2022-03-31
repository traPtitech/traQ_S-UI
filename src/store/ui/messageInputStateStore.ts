import { defineStore, acceptHMRUpdate } from 'pinia'
import { reactive, computed, Ref, unref, watch } from 'vue'
import { AttachmentType } from '/@/lib/basic/file'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { ChannelId } from '/@/types/entity-ids'

/**
 * 基本的に直接利用しないで`/@/composables/messageInputState`を利用する
 */

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

const useMessageInputStateStorePinia = defineStore(
  'ui/messageInputStateStore',
  () => {
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
  }
)

export const useMessageInputStateStore = convertToRefsStore(
  useMessageInputStateStorePinia
)

export const useMessageInputStateIndividual = (
  channelId: MessageInputStateKey
) => {
  const { getStore, setStore } = useMessageInputStateStore()

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
  const { getStore, setStore } = useMessageInputStateStore()

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

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMessageInputStateStorePinia, import.meta.hot)
  )
}
