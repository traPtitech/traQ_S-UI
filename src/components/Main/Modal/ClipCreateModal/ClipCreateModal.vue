<template>
  <modal-frame
    title="クリップ"
    :subtitle="messageContent"
    icon-mdi
    icon-name="bookmark"
  >
    <clip-folder-element
      v-for="clipFolder in clipFolders"
      :key="clipFolder.id"
      :folder-name="clipFolder.name"
      :is-selected="selectedState[clipFolder.id]"
      @click="toggleClip(clipFolder.id)"
    />
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import apis from '@/lib/apis'
import { compareString } from '@/lib/util/string'
import { MessageId, ClipFolderId } from '@/types/entity-ids'
import ModalFrame from '../Common/ModalFrame.vue'
import ClipFolderElement from './ClipFolderElement.vue'

const useCreateClip = (
  props: { messageId: MessageId },
  selectedState: Record<ClipFolderId, boolean>
) => {
  const createClip = async (clipFolderId: ClipFolderId) => {
    try {
      await apis.clipMessage(clipFolderId, {
        messageId: props.messageId
      })
      selectedState[clipFolderId] = true
    } catch (e) {
      if (e.response.status === 409) {
        window.alert('すでに追加されています')
        selectedState[clipFolderId] = true
        return
      }
      throw e
    }
  }
  const deleteClip = async (clipFolderId: ClipFolderId) => {
    await apis.unclipMessage(clipFolderId, props.messageId)
    selectedState[clipFolderId] = false
  }
  const toggleClip = async (clipFolderId: ClipFolderId) => {
    if (selectedState[clipFolderId]) {
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
    ClipFolderElement
  },
  props: {
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const message = computed(
      () => store.state.entities.messages[props.messageId]
    )
    const clipFolders = computed(() => {
      const folders = Object.values(store.state.entities.clipFolders)
      folders.sort((a, b) => compareString(a?.name, b?.name))
      return folders
    })
    const selectedState = reactive(
      Object.fromEntries(
        clipFolders.value.map(folder => [folder?.id ?? '', false])
      ) as Record<ClipFolderId, boolean>
    )
    const messageContent = computed(() => message.value?.content ?? '')
    const { toggleClip } = useCreateClip(props, selectedState)
    return { messageContent, clipFolders, selectedState, toggleClip }
  }
})
</script>

<style lang="scss" module>
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
