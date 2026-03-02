<template>
  <template v-if="canShow">
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
      <PlayIcon v-if="isAnimatedImage" :class="$style.playIcon" />
    </router-link>
    <router-link v-else :to="fileLink" :class="$style.container">
      <!--
        CSSで固定値指定なのでheight, widthはつけない
      -->
      <img draggable="false" :alt="name" :src="fileThumbnailPath" />
      <PlayIcon v-if="isAnimatedImage" :class="$style.playIcon" />
    </router-link>
  </template>
  <div v-else :class="$style.container">表示できない画像です</div>
</template>

<script lang="ts" setup>
import PlayIcon from '/@/components/UI/PlayIcon.vue'
import useFileThumbnail from '/@/composables/files/useFileThumbnail'
import type { ChannelId, DMChannelId, FileId } from '/@/types/entity-ids'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId | DMChannelId
    isLarge?: boolean
    fileId?: FileId
  }>(),
  {
    isLarge: false,
    fileId: ''
  }
)

const {
  name,
  fileLink,
  canShow,
  fileThumbnailPath,
  fileThumbnailSize,
  isAnimatedImage
} = useFileThumbnail(props)
</script>

<style lang="scss" module>
.container {
  flex-shrink: 0;
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
    color: $theme-background-secondary-border;
  }
  img {
    cursor: pointer;
  }
}
.largeContainer {
  flex-shrink: 0;
  position: relative;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: {
    width: 2px;
    style: solid;
    color: $theme-background-secondary-border;
  }
  max-width: 100%;
  img {
    width: clamp(100px, 100%, 600px);
    height: auto;
    max-height: 450px;
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
