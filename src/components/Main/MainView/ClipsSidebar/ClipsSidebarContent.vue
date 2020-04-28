<template>
  <div>
    <sidebar-content-container title="名前" :class="$style.item">
      <content-editor
        :value="name"
        :is-editing="isNameEditing"
        @edit-done="onNameEditDone"
        @edit-start="startNameEdit"
        :maxlength="30"
      />
    </sidebar-content-container>
    <sidebar-content-container-foldable title="説明" :class="$style.item">
      <content-editor
        :value="description"
        :is-editing="isDesciptionEditing"
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
  Ref
} from '@vue/composition-api'
import store from '@/store'
import { ClipFolderId } from '@/types/entity-ids'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import SidebarContentContainerFoldable from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '@/components/Main/MainView/MainViewSidebar/ContentEditor.vue'
import apis from '@/lib/apis'

const useEdit = (
  props: { clipFolderId: string },
  name: Ref<string>,
  description: Ref<string>,
  forField: 'name' | 'description'
) => {
  const isEditing = ref(false)
  const startEdit = () => {
    isEditing.value = true
  }
  const onEditDone = async (v: string) => {
    await apis.editClipFolder(props.clipFolderId, {
      name: forField === 'name' ? v : name.value,
      description: forField === 'description' ? v : description.value
    })
    isEditing.value = false
  }
  return { isEditing, startEdit, onEditDone }
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
    const {
      isEditing: isNameEditing,
      startEdit: startNameEdit,
      onEditDone: onNameEditDone
    } = useEdit(props, name, description, 'name')
    const {
      isEditing: isDesciptionEditing,
      startEdit: startDesciptionEdit,
      onEditDone: onDesciptionEditDone
    } = useEdit(props, name, description, 'description')
    return {
      name,
      description,
      isNameEditing,
      startNameEdit,
      onNameEditDone,
      isDesciptionEditing,
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
