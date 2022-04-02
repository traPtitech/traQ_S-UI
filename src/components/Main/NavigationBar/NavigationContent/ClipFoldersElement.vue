<template>
  <router-link :to="clipFolderPath" :class="$style.container">
    <a-icon name="bookmark" mdi :class="$style.icon" />
    <span :class="$style.name">
      {{ clipFolder.name }}
    </span>
  </router-link>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import type { ClipFolder } from '@traptitech/traq'
import { constructClipFoldersPath } from '/@/router'

const props = defineProps<{
  clipFolder: ClipFolder
}>()

const clipFolderPath = computed(() =>
  constructClipFoldersPath(props.clipFolder.id)
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
}
.name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
