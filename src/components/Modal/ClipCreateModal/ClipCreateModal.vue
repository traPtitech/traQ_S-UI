<template>
  <modal-frame title="クリップ" icon-mdi icon-name="bookmark">
    <template #subtitle>
      <markdown-preview
        :class="$style.subtitle"
        :content="messageContent"
        inline
      />
    </template>
    <template #default>
      <clip-folder-element
        v-for="clipFolder in sortedClipFolders"
        :key="clipFolder.id"
        :folder-name="clipFolder.name"
        :is-selected="isSelected.has(clipFolder.id)"
        @click="toggleClip(clipFolder.id)"
      />
    </template>
  </modal-frame>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import apis from '/@/lib/apis'
import type { MessageId, ClipFolderId } from '/@/types/entity-ids'
import { useToastStore } from '/@/store/ui/toast'
import type { AxiosError } from 'axios'
import { useMessagesStore } from '/@/store/entities/messages'
import useSortedClipFolders from '/@/composables/clips/useSortedClipFolders'

const useCreateClip = (
  props: { messageId: MessageId },
  isSelected: Ref<Set<ClipFolderId>>
) => {
  const { addSuccessToast, addErrorToast } = useToastStore()

  const createClip = async (clipFolderId: ClipFolderId) => {
    try {
      await apis.clipMessage(clipFolderId, {
        messageId: props.messageId
      })
      isSelected.value.add(clipFolderId)
      addSuccessToast('クリップフォルダに追加しました')
    } catch (e) {
      if ((e as AxiosError).response?.status === 409) {
        isSelected.value.add(clipFolderId)
        addErrorToast('すでに追加されています')
        return
      } else {
        addErrorToast('追加に失敗しました')
      }
      throw e
    }
  }
  const deleteClip = async (clipFolderId: ClipFolderId) => {
    await apis.unclipMessage(clipFolderId, props.messageId)
    isSelected.value.delete(clipFolderId)
    addSuccessToast('クリップフォルダから削除しました')
  }
  const toggleClip = async (clipFolderId: ClipFolderId) => {
    if (isSelected.value.has(clipFolderId)) {
      await deleteClip(clipFolderId)
    } else {
      await createClip(clipFolderId)
    }
  }
  return { toggleClip }
}
</script>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import ClipFolderElement from './ClipFolderElement.vue'
import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'

const props = defineProps<{
  messageId: string
}>()

const { messagesMap } = useMessagesStore()
const sortedClipFolders = useSortedClipFolders()

const message = computed(() => messagesMap.value.get(props.messageId))

const isSelected = ref(new Set<ClipFolderId>())
apis.getMessageClips(props.messageId).then(res => {
  isSelected.value = new Set(res.data.map(c => c.folderId))
})

const messageContent = computed(() => message.value?.content ?? '')
const { toggleClip } = useCreateClip(props, isSelected)
</script>

<style lang="scss" module>
.subtitle {
  a {
    pointer-events: none;
  }
}
.item {
  margin: 16px 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
