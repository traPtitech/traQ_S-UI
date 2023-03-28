<template>
  <sidebar-content-container-foldable title="トピック">
    <content-editor
      v-model="localTopic"
      v-model:is-editing="isEditing"
      :max-length="500"
    >
      <template #default="slotProps">
        <inline-markdown :content="slotProps.content" accept-action />
      </template>
    </content-editor>
  </sidebar-content-container-foldable>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import apis from '/@/lib/apis'
import type { ChannelId } from '/@/types/entity-ids'
import { useChannelsStore } from '/@/store/entities/channels'
import SidebarContentContainerFoldable from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '/@/components/Main/MainView/PrimaryViewSidebar/ContentEditor.vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import useLocalInput from '/@/composables/utils/useLocalInput'

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

watch(() => props.channelId, sync)
</script>
