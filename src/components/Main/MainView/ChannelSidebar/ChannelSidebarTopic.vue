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
import { defineComponent, ref, PropType, watchEffect, reactive } from 'vue'
import apis from '@/lib/apis'
import store from '@/store'
import SidebarContentContainerFoldable from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '@/components/Main/MainView/MainViewSidebar/ContentEditor.vue'
import { ChannelId } from '@/types/entity-ids'
import InlineMarkdown from '@/components/UI/InlineMarkdown.vue'

const useEdit = (props: { channelId: string }, state: { topic: string }) => {
  const isEditing = ref(false)
  const onInput = (value: string) => {
    state.topic = value
  }
  const startEdit = () => {
    isEditing.value = true
  }
  const onEditDone = async () => {
    await apis.editChannelTopic(props.channelId, { topic: state.topic })
    isEditing.value = false
  }
  return { isEditing, onInput, startEdit, onEditDone }
}

export default defineComponent({
  name: 'ChannelSidebarTopic',
  components: {
    SidebarContentContainerFoldable,
    ContentEditor,
    InlineMarkdown
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const getTopic = () =>
      store.state.entities.channelsMap.get(props.channelId)?.topic ?? ''

    const topic = ref(getTopic())
    const state = reactive({
      topic: getTopic()
    })
    watchEffect(() => {
      topic.value = getTopic()
    })
    const { isEditing, onInput, startEdit, onEditDone } = useEdit(props, state)
    return {
      topic,
      isEditing,
      startEdit,
      onEditDone,
      onInput
    }
  }
})
</script>
