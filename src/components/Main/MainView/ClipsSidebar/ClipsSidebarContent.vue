<template>
  <div>
    <sidebar-content-container title="名前" :class="$style.item">
      <content-editor
        :value="name"
        :is-editing="isNameEditing"
        @input="onNameInput"
        @edit-done="onNameEditDone"
        @edit-start="startNameEdit"
        :maxlength="30"
      />
    </sidebar-content-container>
    <sidebar-content-container-foldable title="説明" :class="$style.item">
      <content-editor
        :value="description"
        :is-editing="isDesciptionEditing"
        @input="onDesciptionInput"
        @edit-done="onDesciptionEditDone"
        @edit-start="startDesciptionEdit"
      />
    </sidebar-content-container-foldable>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  ref,
  reactive
} from '@vue/composition-api'
import store from '@/store'
import { ClipFolderId } from '@/types/entity-ids'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import SidebarContentContainerFoldable from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '@/components/Main/MainView/MainViewSidebar/ContentEditor.vue'
import apis from '@/lib/apis'

const useEdit = (
  props: { clipFolderId: string },
  state: {
    name: string
    description: string
  },
  forField: 'name' | 'description'
) => {
  const isEditing = ref(false)
  const onInput = (value: string) => {
    state[forField] = value
  }
  const startEdit = () => {
    isEditing.value = true
  }
  const onEditDone = async () => {
    await apis.editClipFolder(props.clipFolderId, {
      name: state.name,
      description: state.description
    })
    isEditing.value = false
  }
  return { isEditing, onInput, startEdit, onEditDone }
}

export default defineComponent({
  name: 'ClipsSidebarContent',
  components: {
    SidebarContentContainer,
    SidebarContentContainerFoldable,
    ContentEditor
  },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  setup(props) {
    const name = computed(
      () => store.state.entities.clipFolders[props.clipFolderId]?.name ?? ''
    )
    const description = computed(
      () =>
        store.state.entities.clipFolders[props.clipFolderId]?.description ?? ''
    )
    const state = reactive({
      name: store.state.entities.clipFolders[props.clipFolderId]?.name ?? '',
      description:
        store.state.entities.clipFolders[props.clipFolderId]?.description ?? ''
    })
    const {
      isEditing: isNameEditing,
      onInput: onNameInput,
      startEdit: startNameEdit,
      onEditDone: onNameEditDone
    } = useEdit(props, state, 'name')
    const {
      isEditing: isDesciptionEditing,
      onInput: onDesciptionInput,
      startEdit: startDesciptionEdit,
      onEditDone: onDesciptionEditDone
    } = useEdit(props, state, 'description')
    return {
      name,
      description,
      isNameEditing,
      onNameInput,
      startNameEdit,
      onNameEditDone,
      isDesciptionEditing,
      onDesciptionInput,
      startDesciptionEdit,
      onDesciptionEditDone
    }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
