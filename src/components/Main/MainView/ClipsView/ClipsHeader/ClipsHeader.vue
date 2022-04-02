<template>
  <primary-view-header>
    <template #header>
      <primary-view-header-title
        :class="$style.header"
        :title="clipFolderName"
        icon-mdi
        icon-name="bookmark"
      />
    </template>
    <template #tools>
      <primary-view-header-tools-item
        icon-mdi
        icon-name="info-outline"
        @click="openSidebar"
      />
    </template>
  </primary-view-header>
</template>

<script lang="ts" setup>
import PrimaryViewHeader from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeader.vue'
import PrimaryViewHeaderTitle from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderTitle.vue'
import PrimaryViewHeaderToolsItem from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderToolsItem.vue'
import { computed } from 'vue'
import type { ClipFolderId } from '/@/types/entity-ids'
import useSidebar from '/@/composables/mainView/useSidebar'
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
