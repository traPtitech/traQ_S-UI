<template>
  <div :class="$style.container" :data-is-white="$boolAttr(isWhite)">
    <file-type-icon
      :type="fileType"
      :size="36"
      :is-animated-image="isAnimatedImage"
      :class="$style.icon"
    />
    <div
      :class="$style.fileName"
      :data-is-ellipsis="$boolAttr(isEllipsis)"
      :title="name"
    >
      {{ name }}
    </div>
    <div :class="$style.fileSize">
      {{ fileSize }}
    </div>
    <a-icon
      mdi
      name="download"
      :size="24"
      :class="$style.dl"
      @click.prevent="onFileDownloadLinkClick"
    />
  </div>
</template>

<script lang="ts" setup>
import FileTypeIcon from '/@/components/UI/FileTypeIcon.vue';
import AIcon from '/@/components/UI/AIcon.vue';
import { computed } from 'vue';
import useFileMeta from '/@/composables/useFileMeta'

const props = withDefaults(defineProps<{
    fileId: string,
    isWhite?: boolean,
    isEllipsis?: boolean
}>(), {
    isWhite: false,
    isEllipsis: false
});

const {
  fileMeta,
  fileType,
  fileSize,
  onFileDownloadLinkClick,
  isAnimatedImage
} = useFileMeta(props)
const name = computed(() => fileMeta.value?.name ?? 'unknown')
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  width: 100%;
  grid-template:
    'icon ... name ... dl' minmax(min-content, 20px)
    'icon ... size ... dl' minmax(min-content, 16px)
    / 36px 16px auto 16px 24px;
  &[data-is-white] {
    @include color-common-text-white-primary;
  }
}
.icon {
  grid-area: icon;
  margin: auto;
}
.dl {
  grid-area: dl;
  margin: auto;
  cursor: pointer;
}
.fileName {
  grid-area: name;
  min-width: 0;
  word-break: keep-all;
  overflow-wrap: break-word;
  &[data-is-ellipsis] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.fileSize {
  @include color-ui-secondary;
  grid-area: size;
  display: flex;
  align-items: center;
  .container[data-is-white] & {
    @include color-common-text-white-secondary;
  }
}
</style>
