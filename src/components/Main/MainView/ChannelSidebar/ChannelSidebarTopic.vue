<template>
  <sidebar-content-container-foldable title="トピック">
    <content-editor
      :value="topic"
      :is-editing="isEditing"
      @edit-done="onEditDone"
      @edit-start="startEdit"
    />
  </sidebar-content-container-foldable>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  PropType,
  computed
} from '@vue/composition-api'
import apis from '@/lib/apis'
import store from '@/store'
import SidebarContentContainerFoldable from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '@/components/Main/MainView/MainViewSidebar/ContentEditor.vue'
import { ChannelId } from '@/types/entity-ids'

const useEdit = (props: { channelId: string }, topic: Ref<string>) => {
  const isEditing = ref(false)
  const startEdit = () => {
    isEditing.value = true
  }
  const onEditDone = async (topic: string) => {
    await apis.editChannelTopic(props.channelId, { topic })
    isEditing.value = false
  }
  return { isEditing, startEdit, onEditDone }
}

export default defineComponent({
  name: 'ChannelSidebarTopic',
  components: {
    SidebarContentContainerFoldable,
    ContentEditor
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const topic = computed(() => store.state.domain.messagesView.topic)
    const { isEditing, startEdit, onEditDone } = useEdit(props, topic)
    return {
      topic,
      isEditing,
      startEdit,
      onEditDone
    }
  }
})
</script>
