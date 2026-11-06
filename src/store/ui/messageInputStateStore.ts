import type { Ref } from 'vue'
import { computed, readonly, ref, toRef, unref, watch } from 'vue'

import { promisifyRequest } from 'idb-keyval'
import { acceptHMRUpdate, defineStore } from 'pinia'

import useIndexedDbValue, {
  key as indexedDbKey
} from '/@/composables/storage/useIndexedDbValue'
import type { AttachmentType } from '/@/lib/basic/file'
import { useChannelsStore } from '/@/store/entities/channels'
import { useToastStore } from '/@/store/ui/toast'
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

export type ReadonlyMessageInputState = Readonly<{
  text: string
  attachments: readonly Readonly<Attachment>[]
}>

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
  draftKey: string
  textVersion: number
  state: ReadonlyMessageInputState
  isEmpty: boolean
}>

const useMessageInputStateStorePinia = defineStore(
  'ui/messageInputStateStore',
  () => {
    const initialValue = {
      messageInputState: new Map<ChannelId, MessageInputState>()
    }
    const changedDuringRestoration = new Set<ChannelId>()
    const restorationState = ref<'restoring' | 'ready' | 'error'>('restoring')
    const { channelsMap } = useChannelsStore()
    const { addErrorToast } = useToastStore()

    const [state, , restoringPromise] = useIndexedDbValue(
      'store/ui/messageInputStateStore',
      1,
      {
        1: async getStore => {
          const store = getStore()
          const setReq = store.put(initialValue, indexedDbKey)
          await promisifyRequest(setReq)
        }
      },
      initialValue,
      saved => {
        const drafts = new Map(saved.messageInputState)

        for (const id of changedDuringRestoration) {
          const current = state.messageInputState.get(id)

          if (current) drafts.set(id, current)
          else drafts.delete(id)
        }

        for (const id of drafts.keys()) {
          if (channelsMap.value.get(id)?.archived) drafts.delete(id)
        }

        return { messageInputState: drafts }
      }
    )

    void restoringPromise.then(
      () => {
        changedDuringRestoration.clear()
        restorationState.value = 'ready'
      },
      () => {
        changedDuringRestoration.clear()
        restorationState.value = 'error'
        addErrorToast(
          '下書きを復元できませんでした。この画面での変更は保存されません'
        )
      }
    )

    const states = toRef(() => state.messageInputState)
    const inputChannels = computed(() => readonly([...states.value]))
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

    const getDraft = (
      draftKey: MessageInputStateKey
    ): ReadonlyMessageInputState | undefined => {
      const id = unref(draftKey)
      const st = virtualIds.has(id) ? virtualChannelStates : states
      const draft = st.value.get(id)
      return draft ? readonly(draft) : undefined
    }

    const replaceDraft = (
      draftKey: MessageInputStateKey,
      value: ReadonlyMessageInputState
    ) => {
      const id = unref(draftKey)
      const st = virtualIds.has(id) ? virtualChannelStates : states

      if (restorationState.value === 'restoring' && !virtualIds.has(id)) {
        changedDuringRestoration.add(id)
      }

      if ((st.value.get(id)?.text ?? '') !== value.text) {
        textVersions.set(id, (textVersions.get(id) ?? 0) + 1)
      }

      if (value.text !== '' || value.attachments.length > 0) {
        st.value.set(id, {
          ...value,
          attachments: value.attachments.map(attachment => ({ ...attachment }))
        })
      } else {
        st.value.delete(id)
      }
    }

    const updateDraft = (
      draftKey: MessageInputStateKey,
      update: (draft: MessageInputState) => void
    ) => {
      const current = getDraft(draftKey) ?? createDefaultValue()
      const draft = {
        ...current,
        attachments: current.attachments.map(attachment => ({ ...attachment }))
      }

      update(draft)
      replaceDraft(draftKey, draft)
    }

    const getDocumentKey = (draftKey: MessageInputStateKey) => {
      const id = unref(draftKey)

      return `${id}:${documentRevisions.value.get(id) ?? 0}`
    }

    const captureDraftSnapshot = (
      draftKey: MessageInputStateKey
    ): DraftSnapshot => {
      const id = unref(draftKey)
      const current = getDraft(id) ?? createDefaultValue()
      const state = {
        text: current.text,
        attachments: [...current.attachments]
      }

      return {
        draftKey: id,
        textVersion: textVersions.get(id) ?? 0,
        state: readonly(state),
        isEmpty: state.text === '' && state.attachments.length === 0
      }
    }

    const consumeSnapshot = (snapshot: DraftSnapshot) => {
      const { draftKey, state } = snapshot
      const latest = getDraft(draftKey)

      if (!latest) return

      const consumesText =
        (textVersions.get(draftKey) ?? 0) === snapshot.textVersion &&
        latest.text === state.text

      updateDraft(draftKey, draft => {
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
          draftKey,
          (documentRevisions.value.get(draftKey) ?? 0) + 1
        )
      }
    }

    return {
      restoringPromise,
      restorationState,
      inputChannels,
      hasInputChannel,
      getDraft,
      replaceDraft,
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
