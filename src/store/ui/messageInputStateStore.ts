import { defineStore, acceptHMRUpdate } from 'pinia'
import type { Ref } from 'vue'
import { computed, unref, toRef } from 'vue'
import type { AttachmentType } from '/@/lib/basic/file'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId } from '/@/types/entity-ids'
import useIndexedDbValue, { key } from '/@/composables/utils/useIndexedDbValue'
import { promisifyRequest } from 'idb-keyval'

/**
 * 基本的に直接利用しないで`/@/composables/messageInputState`を利用する
 */

/**
 * ChannelIdの代わりに一意となるもの
 *
 * share-target: Web Share Target APIで使う画面で利用
 */
const VIRTUAL_IDS = ['share-target'] as const
export type VirtualChannelId = (typeof VIRTUAL_IDS)[number]
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

export const createDefaultValue = () => ({ text: '', attachments: [] })

const useMessageInputStateStorePinia = defineStore(
  'ui/messageInputStateStore',
  () => {
    const initialValue = {
      messageInputState: new Map<
        ChannelId | VirtualChannelId,
        MessageInputState
      >()
    }

    const [state, restoring, restoringPromise] = useIndexedDbValue(
      'store/ui/messageInputStateStore',
      1,
      {
        1: async getStore => {
          const store = getStore()
          const setReq = store.put(initialValue, key)
          await promisifyRequest(setReq)
        }
      },
      initialValue
    )

    const states = toRef(() => state.messageInputState)
    const inputChannels = computed(() =>
      [...states.value].filter(([id]) => !virtualIds.has(id))
    )
    const hasInputChannel = computed(() => inputChannels.value.length > 0)

    const getStore = (cId: MessageInputStateKey) => states.value.get(unref(cId))
    const setStore = (cId: MessageInputStateKey, v: MessageInputState) => {
      // 空のときは削除、空でないときはセット
      if (v && (v.text !== '' || v.attachments.length > 0)) {
        // コピーしないと参照が変わらないから上書きされる
        // toRawしちゃうとreactiveで包めなくなるので、そうはしない
        states.value.set(unref(cId), { ...v })
      } else {
        states.value.delete(unref(cId))
      }
    }

    return { inputChannels, hasInputChannel, getStore, setStore }
  }
)

export const useMessageInputStateStore = convertToRefsStore(
  useMessageInputStateStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMessageInputStateStorePinia, import.meta.hot)
  )
}
