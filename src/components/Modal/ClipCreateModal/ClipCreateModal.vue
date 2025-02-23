<template>
  <modal-frame title="クリップ" icon-mdi icon-name="bookmark">
    <template #subtitle>
      <inline-markdown :class="$style.subtitle" :content="messageContent" />
    </template>
    <template #default>
      <div>
        <clip-folder-element
          v-for="clipFolder in sortedClipFolders"
          :key="clipFolder.id"
          :folder-name="clipFolder.name"
          :is-selected="isSelected.has(clipFolder.id)"
          @click="toggleClip(clipFolder.id)"
        />
        <clip-folder-new @create-clip-folder="handleCreateClipFolder" />
      </div>
    </template>
  </modal-frame>
</template>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import ClipFolderElement from './ClipFolderElement.vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { computed, ref } from 'vue'
import apis from '/@/lib/apis'
import type { ClipFolderId } from '/@/types/entity-ids'
import { useMessagesStore } from '/@/store/entities/messages'
import useSortedClipFolders from '/@/composables/clips/useSortedClipFolders'
import { useCreateClip } from '/@/composables/clips/createClip'
import ClipFolderNew from './ClipFolderNew.vue'

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
const { toggleClip } = useCreateClip(props.messageId, isSelected)

const handleCreateClipFolder = (newClipFolderId: ClipFolderId) => {
  toggleClip(newClipFolderId)
}
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

.buttonContainer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
