import type { Ref } from 'vue'
import { computed, ref, toRef, unref, watch } from 'vue'

import { promisifyRequest } from 'idb-keyval'
import { acceptHMRUpdate, defineStore } from 'pinia'

import useIndexedDbValue, {
  key
} from '/@/composables/storage/useIndexedDbValue'
import type { AttachmentType } from '/@/lib/basic/file'
import { useChannelsStore } from '/@/store/entities/channels'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId } from '/@/types/entity-ids'

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

export const createDefaultValue = (): MessageInputState => ({
  text: '',
  attachments: []
})

export type DraftSnapshot = Readonly<{
  key: string
  textVersion: number
  state: Readonly<{ text: string; attachments: readonly Attachment[] }>
  isEmpty: boolean
}>

const useMessageInputStateStorePinia = defineStore(
  'ui/messageInputStateStore',
  () => {
    const initialValue = {
      messageInputState: new Map<ChannelId, MessageInputState>()
    }

    const [state, , restoringPromise] = useIndexedDbValue(
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

    const { channelsMap } = useChannelsStore()

    const states = toRef(() => state.messageInputState)
    const inputChannels = computed(() => [...states.value])
    const hasInputChannel = computed(() => inputChannels.value.length > 0)
    const virtualChannelStates = ref(
      new Map<VirtualChannelId, MessageInputState>()
    )
    const documentRevisions = ref(new Map<string, number>())
    const textVersions = new Map<string, number>()

    watch(
      channelsMap,
      newChannelsMap =>
        inputChannels.value
          .filter(([cid]) => newChannelsMap.get(cid)?.archived)
          .forEach(([cid]) => {
            states.value.delete(cid)
          }),
      { deep: true }
    )

    const getStore = (cId: MessageInputStateKey) => {
      const cId_ = unref(cId)
      const st = virtualIds.has(cId_) ? virtualChannelStates : states
      return st.value.get(cId_)
    }

    const setStore = (cId: MessageInputStateKey, v: MessageInputState) => {
      const cId_ = unref(cId)
      const st = virtualIds.has(cId_) ? virtualChannelStates : states

      if ((st.value.get(cId_)?.text ?? '') !== v.text) {
        textVersions.set(cId_, (textVersions.get(cId_) ?? 0) + 1)
      }

      // 空のときは削除、空でないときはセット
      if (v && (v.text !== '' || v.attachments.length > 0)) {
        // コピーしないと参照が変わらないから上書きされる
        // toRawしちゃうとreactiveで包めなくなるので、そうはしない
        st.value.set(cId_, { ...v })
      } else {
        st.value.delete(cId_)
      }
    }

    const updateDraft = (
      key: MessageInputStateKey,
      update: (draft: MessageInputState) => void
    ) => {
      const current = getStore(key) ?? createDefaultValue()
      const draft = { ...current, attachments: [...current.attachments] }

      update(draft)
      setStore(key, draft)
    }

    const getDocumentKey = (key: MessageInputStateKey) => {
      const id = unref(key)

      return `${id}:${documentRevisions.value.get(id) ?? 0}`
    }

    const captureDraftSnapshot = (key: MessageInputStateKey): DraftSnapshot => {
      const id = unref(key)
      const current = getStore(id) ?? createDefaultValue()
      const state = {
        text: current.text,
        attachments: [...current.attachments]
      }

      return {
        key: id,
        textVersion: textVersions.get(id) ?? 0,
        state,
        isEmpty: state.text === '' && state.attachments.length === 0
      }
    }

    const consumeSnapshot = (snapshot: DraftSnapshot) => {
      const { key, state } = snapshot
      const latest = getStore(key)

      if (!latest) return

      const consumesText =
        (textVersions.get(key) ?? 0) === snapshot.textVersion &&
        latest.text === state.text

      updateDraft(key, draft => {
        if (consumesText) draft.text = ''

        const sentFiles = new Set(
          state.attachments.map(attachment => attachment.file)
        )
        draft.attachments = draft.attachments.filter(
          attachment => !sentFiles.has(attachment.file)
        )
      })

      if (consumesText) {
        documentRevisions.value.set(
          key,
          (documentRevisions.value.get(key) ?? 0) + 1
        )
      }
    }

    return {
      restoringPromise,
      inputChannels,
      hasInputChannel,
      getStore,
      setStore,
      updateDraft,
      getDocumentKey,
      captureDraftSnapshot,
      consumeSnapshot
    }
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
