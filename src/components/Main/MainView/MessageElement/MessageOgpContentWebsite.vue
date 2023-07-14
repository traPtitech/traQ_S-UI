<template>
  <a
    :href="url"
    :class="$style.container"
    rel="noopener noreferrer"
    target="_blank"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      draggable="false"
      :class="$style.image"
      alt=""
    />
    <message-ogp-description
      :class="$style.description"
      :url="url"
      :title="title"
      :description="description"
    />
  </a>
</template>

<script lang="ts" setup>
import MessageOgpDescription from './MessageOgpDescription.vue'

withDefaults(
  defineProps<{
    url: string
    imageUrl?: string
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
  height: 100%;
  max-height: 10rem;
}
.description {
  max-width: 100%;
  padding: 1rem;
  flex: 1 1 15rem;
}
</style>
