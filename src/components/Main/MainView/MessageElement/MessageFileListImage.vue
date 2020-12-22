<template>
  <router-link :to="fileLink" v-if="isLarge" :class="$style.largeContainer">
    <!--
      height, widthはlayout shift対策
      https://www.mizdra.net/entry/2020/05/31/192613
    -->
    <img
      draggable="false"
      :alt="fileMeta.name"
      :src="fileThumbnailPath"
      :height="fileThumbnailSize.height"
      :width="fileThumbnailSize.width"
    />
  </router-link>
  <router-link v-else :to="fileLink" :class="$style.container">
    <!--
      CSSで固定値指定なのでheight, widthはつけない
    -->
    <img draggable="false" :alt="fileMeta.name" :src="fileThumbnailPath" />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'

export default defineComponent({
  name: 'MessageFileListItem',
  props: {
    isLarge: {
      type: Boolean,
      default: false
    },
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const {
      fileMeta,
      fileLink,
      fileThumbnailPath,
      fileThumbnailSize
    } = useFileMeta(props, context)
    return { fileThumbnailPath, fileThumbnailSize, fileLink, fileMeta }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 240px;
  max-width: 100%;
  height: 160px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: {
    width: 2px;
    style: solid;
    color: $theme-background-secondary;
  }
  img {
    cursor: pointer;
  }
}
.largeContainer {
  border-radius: 6px;
  overflow: hidden;
  border: {
    width: 2px;
    style: solid;
    color: $theme-background-secondary;
  }
  max-width: 100%;
  img {
    height: 100%;
    width: min(600px, 100%);
    max-height: 450px;
    cursor: pointer;
  }
}
</style>
