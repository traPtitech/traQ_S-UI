<template>
  <router-link :to="clipFolderPath" :class="$style.container">
    <AIcon
      name="bookmark"
      mdi
      :class="$style.icon"
      :data-is-selected="$boolAttr(isSelected)"
    />
    <span :class="$style.name">
      {{ clipFolder.name }}
    </span>
  </router-link>
</template>

<script lang="ts" setup>
import type { ClipFolder } from '@traptitech/traq'

import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import { constructClipFoldersPath } from '/@/router'
import { useMainViewStore } from '/@/store/ui/mainView'

const props = defineProps<{
  clipFolder: ClipFolder
}>()
const { primaryView } = useMainViewStore()
const clipFolderPath = computed(() =>
  constructClipFoldersPath(props.clipFolder.id)
)
const isSelected = computed(
  () =>
    primaryView.value.type === 'clips' &&
    props.clipFolder.id === primaryView.value.clipFolderId
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include size-body1;
  display: flex;
  padding: 2px;
  cursor: pointer;
}
.icon {
  flex-shrink: 0;
  margin-right: 16px;
  &[data-is-selected] {
    @include color-accent-primary;
  }
}
.name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
