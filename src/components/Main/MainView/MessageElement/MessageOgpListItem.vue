<template>
  <div :class="$style.container">
    <message-ogp-content-video
      v-if="isVideoType && imageUrl && videoUrl"
      :url="ogpData.url"
      :title="ogpData.title"
      :description="ogpData.description"
      :preview-url="imageUrl"
      :embedded-url="videoUrl"
    />
    <message-ogp-content-website
      v-else
      :url="ogpData.url"
      :title="ogpData.title"
      :description="ogpData.description"
      :image-url="imageUrl"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Ogp } from '@traptitech/traq'
import MessageOgpContentVideo from './MessageOgpContentVideo.vue'
import MessageOgpContentWebsite from './MessageOgpContentWebsite.vue'
import { ifIsHttps } from '/@/lib/basic/url'

const props = defineProps<{
  ogpData: Ogp
}>()

const imageUrl = computed(() => {
  const item = props.ogpData.images[0]
  return ifIsHttps(item?.secureUrl ?? item?.url)
})
const videoUrl = computed(() => {
  const item = props.ogpData.videos[0]
  return ifIsHttps(item?.secureUrl ?? item?.url)
})
const isVideoType = computed(() => props.ogpData.type.startsWith('video'))
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  border-radius: 4px;
  overflow: hidden;
  width: max-content;
  max-width: 100%;
}
</style>
