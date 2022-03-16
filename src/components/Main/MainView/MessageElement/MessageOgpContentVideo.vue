<template>
  <div :class="$style.container">
    <message-ogp-embed
      :preview-url="previewUrl"
      :embedded-url="embeddedUrl"
      show-play-icon
      @click.prevent.stop
    />
    <a
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      :class="$style.description"
    >
      <message-ogp-description
        :url="url"
        :title="title"
        :description="description"
      />
    </a>
  </div>
</template>

<script lang="ts" setup>
import MessageOgpEmbed from './MessageOgpEmbed.vue'
import MessageOgpDescription from './MessageOgpDescription.vue'

withDefaults(
  defineProps<{
    url: string
    previewUrl: string
    embeddedUrl: string
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
  width: 27rem;
  max-width: 100%;
}
.description {
  display: block;
  padding: 1rem;
}
</style>
