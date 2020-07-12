<template>
  <div :class="$style.container">
    <message-ogp-content-video
      v-if="shouldShowVideo"
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
import { defineComponent, computed, PropType } from '@vue/composition-api'
import { Ogp } from '@traptitech/traq'
import MessageOgpContentVideo from './MessageOgpContentVideo.vue'
import MessageOgpContentWebsite from './MessageOgpContentWebsite.vue'

const useOgpData = (props: { ogpData: Ogp }) => {
  const imageUrl = computed(() => {
    const item = props.ogpData.images?.[0]
    return item?.secureUrl ?? item?.url
  })
  const videoUrl = computed(() => {
    const item = props.ogpData.videos?.[0]
    return item?.secureUrl ?? item?.url
  })
  const shouldShowVideo = computed(() => {
    if (props.ogpData?.type?.startsWith('video')) {
      return videoUrl.value && imageUrl.value
    } else {
      return false
    }
  })
  return { shouldShowVideo, imageUrl, videoUrl }
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
    const { shouldShowVideo, imageUrl, videoUrl } = useOgpData(props)
    return { shouldShowVideo, imageUrl, videoUrl }
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
