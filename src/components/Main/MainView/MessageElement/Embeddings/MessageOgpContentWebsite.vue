<template>
  <a
    :href="url"
    :class="$style.container"
    rel="noopener noreferrer"
    target="_blank"
  >
    <SkeletonImage
      v-if="imageUrl"
      :class="$style.image"
      :src="imageUrl"
      :style="imageHeight ? { height: `${imageHeight}px` } : {}"
      draggable="false"
      :width="imageWidth"
      :height="imageHeight"
    />
    <MessageOgpDescription
      :class="$style.description"
      :url="url"
      :title="title"
      :description="description"
    />
  </a>
</template>

<script lang="ts" setup>
import SkeletonImage from '/@/components/UI/SkeletonImage.vue'

import MessageOgpDescription from './MessageOgpDescription.vue'

withDefaults(
  defineProps<{
    url: string
    imageUrl?: string
    imageWidth?: number
    imageHeight?: number
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: ''
  }
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 40rem;
  max-width: 100%;
}
.image {
  width: auto;
  height: 100%;
  max-height: 10rem;
}
.description {
  max-width: 100%;
  padding: 1rem;
  flex: 1 1 15rem;
}
</style>
