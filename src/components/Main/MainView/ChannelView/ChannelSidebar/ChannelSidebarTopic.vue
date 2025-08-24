<template>
  <sidebar-content-container-foldable title="トピック">
    <content-editor
      v-model="localTopic"
      v-model:is-editing="isEditing"
      :max-length="500"
    >
      <template #default="slotProps">
        <markdown-preview :content="slotProps.content" accept-action inline />
      </template>
    </content-editor>
  </sidebar-content-container-foldable>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import ContentEditor from '/@/components/Main/MainView/PrimaryViewSidebar/ContentEditor.vue'
import SidebarContentContainerFoldable from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerFoldable.vue'
import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'
import useLocalInput from '/@/composables/utils/useLocalInput'
import apis from '/@/lib/apis'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelsMap } = useChannelsStore()

const remoteTopic = computed(
  () => channelsMap.value.get(props.channelId)?.topic ?? ''
)
const {
  localValue: localTopic,
  isEditing,
  sync
} = useLocalInput(remoteTopic, async topic => {
  try {
    await apis.editChannelTopic(props.channelId, { topic })
    return true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return false
  }
})

watch(
  () => props.channelId,
  () => {
    sync()
    isEditing.value = false
  }
)
</script>
