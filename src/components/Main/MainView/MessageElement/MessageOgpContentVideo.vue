<template>
  <div :class="$style.container">
    <message-ogp-embed
      :preview-url="previewUrl"
      :embedded-url="embeddedUrl"
      :class="$style.video"
      @click.prevent
      show-play-icon
    />
    <a :href="url" target="_blank">
      <message-ogp-description
        :url="url"
        :title="title"
        :description="description"
      />
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
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
  width: 400px;
  max-width: 100%;
}
.video {
  margin-bottom: 1rem;
}
</style>
