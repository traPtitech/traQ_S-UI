<template>
  <div :class="$style.container" :data-is-white="isWhite">
    <icon mdi :name="fileIconName" :size="36" :class="$style.icon" />
    <div :class="$style.fileName" :data-is-ellipsis="isEllipsis">
      {{ fileMeta ? fileMeta.name : 'unknown' }}
    </div>
    <div :class="$style.fileSize">
      {{ fileSize }}
    </div>
    <icon
      mdi
      name="download"
      :size="24"
      :class="$style.dl"
      @click.native="onFileDownloadLinkClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useFileMeta from '@/use/fileMeta'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'FileDescription',
  components: {
    Icon
  },
  props: {
    fileId: {
      type: String,
      required: true
    },
    isWhite: {
      type: Boolean,
      default: false
    },
    isEllipsis: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const {
      fileMeta,
      fileIconName,
      fileSize,
      onFileDownloadLinkClick
    } = useFileMeta(props, context)
    return {
      fileMeta,
      fileIconName,
      fileSize,
      onFileDownloadLinkClick
    }
  }
})
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
