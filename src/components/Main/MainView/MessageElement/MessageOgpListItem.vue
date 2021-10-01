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

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { Ogp } from '@traptitech/traq'
import MessageOgpContentVideo from './MessageOgpContentVideo.vue'
import MessageOgpContentWebsite from './MessageOgpContentWebsite.vue'

const ifIsHttps = (url: string | undefined) => {
  if (url === undefined) return undefined

  let urlObj: URL
  try {
    urlObj = new URL(url)
  } catch {
    return undefined
  }
  return urlObj.protocol === 'https:' ? url : undefined
}

const useOgpData = (props: { ogpData: Ogp }) => {
  const imageUrl = computed(() => {
    const item = props.ogpData.images?.[0]
    return ifIsHttps(item?.secureUrl ?? item?.url)
  })
  const videoUrl = computed(() => {
    const item = props.ogpData.videos?.[0]
    return ifIsHttps(item?.secureUrl ?? item?.url)
  })
  const isVideoType = computed(() => props.ogpData?.type?.startsWith('video'))
  return { isVideoType, imageUrl, videoUrl }
}

export default defineComponent({
  name: 'MessageOgpListItem',
  components: {
    MessageOgpContentVideo,
    MessageOgpContentWebsite
  },
  props: {
    ogpData: {
      type: Object as PropType<Ogp>,
      required: true
    }
  },
  setup(props) {
    const { isVideoType, imageUrl, videoUrl } = useOgpData(props)
    return { isVideoType, imageUrl, videoUrl }
  }
})
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
