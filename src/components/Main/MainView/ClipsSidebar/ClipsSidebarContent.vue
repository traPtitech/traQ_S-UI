<template>
  <div :class="$style.container">
    <sidebar-content-container title="名前" :class="$style.item">
      <content-editor
        :value="name"
        :is-editing="isNameEditing"
        :max-length="30"
        @input-value="onNameInput"
        @edit-done="onNameEditDone"
        @edit-start="startNameEdit"
      >
        <template #default="slotProps">
          {{ slotProps.content }}
        </template>
      </content-editor>
    </sidebar-content-container>
    <sidebar-content-container-foldable title="説明" :class="$style.item">
      <content-editor
        :value="description"
        :is-editing="isDesciptionEditing"
        :max-length="1000"
        @input-value="onDesciptionInput"
        @edit-done="onDesciptionEditDone"
        @edit-start="startDesciptionEdit"
      >
        <template #default="slotProps">
          <inline-markdown :content="slotProps.content" accept-action />
        </template>
      </content-editor>
    </sidebar-content-container-foldable>
    <div :class="$style.item">
      <form-button label="削除" color="error" @click="deleteClip" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, reactive } from 'vue'
import store from '/@/store'
import { ClipFolderId } from '/@/types/entity-ids'
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import SidebarContentContainerFoldable from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '/@/components/Main/MainView/MainViewSidebar/ContentEditor.vue'
import apis from '/@/lib/apis'
import FormButton from '/@/components/UI/FormButton.vue'
import router, { constructChannelPath } from '/@/router'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

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

const useDelete = (props: { clipFolderId: ClipFolderId }) => {
  const deleteClip = async () => {
    if (!window.confirm('本当に削除しますか？')) {
      return
    }
    await apis.deleteClipFolder(props.clipFolderId)
    const clipFolders = [...store.state.entities.clipFoldersMap.values()]
      .filter(v => v.id !== props.clipFolderId)
      .sort((a, b) => {
        const aDate = new Date(a.createdAt)
        const bDate = new Date(b.createdAt)
        if (aDate < bDate) return -1
        else if (aDate > bDate) return 1
        else return 0
      })
    if (clipFolders.length > 0) {
      router.push(`/clip-folders/${clipFolders[0].id}`)
      return
    }
    router.push(
      constructChannelPath(store.getters.app.browserSettings.defaultChannelName)
    )
  }
  return { deleteClip }
}

export default defineComponent({
  name: 'ClipsSidebarContent',
  components: {
    SidebarContentContainer,
    SidebarContentContainerFoldable,
    ContentEditor,
    InlineMarkdown,
    FormButton
  },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  setup(props) {
    const clipFolder = computed(() =>
      store.state.entities.clipFoldersMap.get(props.clipFolderId)
    )
    const name = computed(() => clipFolder.value?.name ?? '')
    const description = computed(() => clipFolder.value?.description ?? '')
    const state = reactive({
      name: clipFolder.value?.name ?? '',
      description: clipFolder.value?.description ?? ''
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

    const { deleteClip } = useDelete(props)

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
      onDesciptionEditDone,
      deleteClip
    }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin: auto;
    margin-top: 32px;
  }
}
</style>
