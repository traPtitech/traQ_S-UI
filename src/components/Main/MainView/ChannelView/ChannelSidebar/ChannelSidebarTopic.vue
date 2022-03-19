<template>
  <sidebar-content-container-foldable title="トピック">
    <content-editor
      v-model="localTopic"
      v-model:is-editing="isEditing"
      :max-length="200"
    >
      <template #default="slotProps">
        <inline-markdown :content="slotProps.content" accept-action />
      </template>
    </content-editor>
  </sidebar-content-container-foldable>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import apis from '/@/lib/apis'
import { ChannelId } from '/@/types/entity-ids'
import { useChannelsStore } from '/@/store/entities/channels'
import SidebarContentContainerFoldable from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '/@/components/Main/MainView/MainViewSidebar/ContentEditor.vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import useLocalInput from '/@/composables/utils/useLocalInput'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelsMap } = useChannelsStore()

const remoteTopic = computed(
  () => channelsMap.value.get(props.channelId)?.topic ?? ''
)
const { localValue: localTopic, isEditing } = useLocalInput(
  remoteTopic,
  async topic => {
    try {
      await apis.editChannelTopic(props.channelId, { topic })
      return true
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      return false
    }
  }
)
</script>
