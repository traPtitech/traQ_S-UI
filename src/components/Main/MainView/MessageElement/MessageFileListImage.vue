<template>
  <router-link v-if="isLarge" :to="fileLink" :class="$style.largeContainer">
    <!--
      height, widthはlayout shift対策
      https://www.mizdra.net/entry/2020/05/31/192613
    -->
    <img
      draggable="false"
      :alt="name"
      :src="fileThumbnailPath"
      :height="fileThumbnailSize.height"
      :width="fileThumbnailSize.width"
    />
    <play-icon v-if="isAnimatedImage" :class="$style.playIcon" />
  </router-link>
  <router-link v-else :to="fileLink" :class="$style.container">
    <!--
      CSSで固定値指定なのでheight, widthはつけない
    -->
    <img draggable="false" :alt="name" :src="fileThumbnailPath" />
    <play-icon v-if="isAnimatedImage" :class="$style.playIcon" />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileThumbnail from '@/use/fileThumbnail'
import PlayIcon from '@/components/UI/PlayIcon.vue'

export default defineComponent({
  name: 'MessageFileListItem',
  components: {
    PlayIcon
  },
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
  setup(props) {
    const {
      name,
      fileLink,
      fileThumbnailPath,
      fileThumbnailSize,
      isAnimatedImage
    } = useFileThumbnail(props)
    return {
      name,
      fileLink,
      fileThumbnailPath,
      fileThumbnailSize,
      isAnimatedImage
    }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
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
  position: relative;
  display: flex;
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
    width: auto;
    max-height: 450px;
    max-width: min(600px, 100%);
    min-width: 100px;
    object-fit: contain;
    cursor: pointer;
  }
}
.playIcon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
</style>
