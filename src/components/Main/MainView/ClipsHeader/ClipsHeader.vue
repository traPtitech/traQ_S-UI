<template>
  <main-view-header>
    <template #header>
      <main-view-header-title
        :class="$style.header"
        :title="clipFolderName"
        icon-mdi
        icon-name="bookmark"
      />
    </template>
    <template #tools>
      <main-view-header-tools-item
        icon-mdi
        icon-name="info-outline"
        @click="openSidebar"
      />
    </template>
  </main-view-header>
</template>

<script lang="ts" setup>
import MainViewHeader from '/@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import MainViewHeaderTitle from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderTitle.vue'
import MainViewHeaderToolsItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderToolsItem.vue'
import { computed } from 'vue'
import { ClipFolderId } from '/@/types/entity-ids'
import useSidebar from '/@/composables/useSidebar'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

const props = defineProps<{
  clipFolderId: ClipFolderId
}>()

const { clipFoldersMap } = useClipFoldersStore()
const clipFolderName = computed(
  () => clipFoldersMap.value.get(props.clipFolderId)?.name ?? ''
)
const { openSidebar } = useSidebar()
</script>

<style lang="scss" module>
.header {
  overflow-x: auto;
  word-break: keep-all;
  white-space: nowrap;
}
</style>
