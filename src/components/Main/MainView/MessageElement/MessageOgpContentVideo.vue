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

<script lang="ts">
import { defineComponent } from 'vue'
import MessageOgpEmbed from './MessageOgpEmbed.vue'
import MessageOgpDescription from './MessageOgpDescription.vue'

export default defineComponent({
  name: 'MessageOgpContentVideo',
  components: { MessageOgpEmbed, MessageOgpDescription },
  props: {
    url: {
      type: String,
      required: true
    },
    previewUrl: {
      type: String,
      required: true
    },
    embeddedUrl: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  setup() {
    return {}
  }
})
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
