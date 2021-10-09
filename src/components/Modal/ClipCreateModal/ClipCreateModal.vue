<template>
  <modal-frame title="クリップ" icon-mdi icon-name="bookmark">
    <template #subtitle>
      <inline-markdown :class="$style.subtitle" :content="messageContent" />
    </template>
    <template #default>
      <clip-folder-element
        v-for="clipFolder in clipFolders"
        :key="clipFolder.id"
        :folder-name="clipFolder.name"
        :is-selected="isSelected.has(clipFolder.id)"
        @click="toggleClip(clipFolder.id)"
      />
    </template>
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from 'vue'
import store from '/@/store'
import apis from '/@/lib/apis'
import { compareString } from '/@/lib/basic/string'
import { MessageId, ClipFolderId } from '/@/types/entity-ids'
import ModalFrame from '../Common/ModalFrame.vue'
import ClipFolderElement from './ClipFolderElement.vue'
import useToastStore from '/@/providers/toastStore'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { AxiosError } from 'axios'

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

export default defineComponent({
  name: 'ClipCreateModal',
  components: {
    ModalFrame,
    InlineMarkdown,
    ClipFolderElement
  },
  props: {
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const message = computed(() =>
      store.state.entities.messages.messagesMap.get(props.messageId)
    )
    const clipFolders = computed(() => {
      const folders = [...store.state.entities.clipFoldersMap.values()]
      folders.sort((a, b) => compareString(a.name, b.name))
      return folders
    })

    const isSelected = ref(new Set<ClipFolderId>())
    apis.getMessageClips(props.messageId).then(res => {
      isSelected.value = new Set(res.data.map(c => c.folderId))
    })

    const messageContent = computed(() => message.value?.content ?? '')
    const { toggleClip } = useCreateClip(props, isSelected)
    return { messageContent, clipFolders, isSelected, toggleClip }
  }
})
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
