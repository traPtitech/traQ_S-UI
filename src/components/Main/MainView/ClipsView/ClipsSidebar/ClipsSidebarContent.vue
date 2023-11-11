<template>
  <div :class="$style.container">
    <sidebar-content-container title="名前" :class="$style.item">
      <content-editor
        v-model="localName"
        v-model:is-editing="isNameEditing"
        :max-length="30"
      >
        <template #default="slotProps">
          {{ slotProps.content }}
        </template>
      </content-editor>
    </sidebar-content-container>
    <sidebar-content-container-foldable title="説明" :class="$style.item">
      <content-editor
        v-model="localDescription"
        v-model:is-editing="isDescriptionEditing"
        :max-length="1000"
      >
        <template #default="slotProps">
          <inline-markdown :content="slotProps.content" accept-action />
        </template>
      </content-editor>
    </sidebar-content-container-foldable>
    <div :class="$style.item">
      <form-button
        label="削除"
        type="secondary"
        is-danger
        @click="deleteClip"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import type { ClipFolderId } from '/@/types/entity-ids'
import apis from '/@/lib/apis'
import router, {
  constructChannelPath,
  constructClipFoldersPath
} from '/@/router'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import SidebarContentContainerFoldable from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerFoldable.vue'
import ContentEditor from '/@/components/Main/MainView/PrimaryViewSidebar/ContentEditor.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import useLocalInput from '/@/composables/utils/useLocalInput'

const props = defineProps<{
  clipFolderId: ClipFolderId
}>()

const { clipFoldersMap } = useClipFoldersStore()

const clipFolder = computed(() => clipFoldersMap.value.get(props.clipFolderId))
const remoteName = computed(() => clipFolder.value?.name ?? '')
const remoteDescription = computed(() => clipFolder.value?.description ?? '')

const { localValue: localName, isEditing: isNameEditing } = useLocalInput(
  remoteName,
  async name => {
    try {
      await apis.editClipFolder(props.clipFolderId, { name })
      return true
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      return false
    }
  }
)

const {
  localValue: localDescription,
  isEditing: isDescriptionEditing,
  sync
} = useLocalInput(remoteDescription, async description => {
  try {
    await apis.editClipFolder(props.clipFolderId, { description })
    return true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return false
  }
})
watch(() => props.clipFolderId, sync)

const { defaultChannelName } = useBrowserSettings()

const deleteClip = async () => {
  if (!window.confirm('本当に削除しますか？')) {
    return
  }
  await apis.deleteClipFolder(props.clipFolderId)
  const clipFolders = [...clipFoldersMap.value.values()]
    .filter(v => v.id !== props.clipFolderId)
    .sort((a, b) => {
      const aDate = new Date(a.createdAt)
      const bDate = new Date(b.createdAt)
      if (aDate < bDate) return -1
      else if (aDate > bDate) return 1
      else return 0
    })
  if (clipFolders[0]) {
    router.push(constructClipFoldersPath(clipFolders[0].id))
    return
  }
  router.push(constructChannelPath(defaultChannelName.value))
}
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
