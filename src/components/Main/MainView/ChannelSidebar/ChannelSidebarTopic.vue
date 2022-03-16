<template>
  <sidebar-content-container-foldable title="トピック">
    <content-editor
      :value="topic"
      :is-editing="isEditing"
      :max-length="200"
      @input-value="onInput"
      @edit-done="onEditDone"
      @edit-start="startEdit"
    >
      <template #default="slotProps">
        <inline-markdown :content="slotProps.content" accept-action />
      </template>
    </content-editor>
  </sidebar-content-container-foldable>
</template>

<script lang="ts">
import { ref, watchEffect, Ref } from 'vue';
import apis from '/@/lib/apis'
import { ChannelId } from '/@/types/entity-ids'
import { useChannelsStore } from '/@/store/entities/channels'

const useEdit = (props: { channelId: string }, topic: Ref<string>) => {
  const isEditing = ref(false)
  const onInput = (value: string) => {
    topic.value = value
  }
  const startEdit = () => {
    isEditing.value = true
  }
  const onEditDone = async () => {
    await apis.editChannelTopic(props.channelId, { topic: topic.value })
    isEditing.value = false
  }
  return { isEditing, onInput, startEdit, onEditDone }
}
</script>

<script lang="ts" setup>
import SidebarContentContainerFoldable from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue';
import ContentEditor from '/@/components/Main/MainView/MainViewSidebar/ContentEditor.vue';
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue';

const props = defineProps<{
    channelId: ChannelId
}>();

const { channelsMap } = useChannelsStore()

const getTopic = () => channelsMap.value.get(props.channelId)?.topic ?? ''

const topic = ref(getTopic())
watchEffect(() => {
  topic.value = getTopic()
})
const { isEditing, onInput, startEdit, onEditDone } = useEdit(props, topic)
</script>
