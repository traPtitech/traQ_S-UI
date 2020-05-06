<template>
  <div :class="$style.container">
    <img
      :ref="thumbnailRef"
      :class="$style.image"
      :src="imageThumbnailState.thumbnailDataUrl"
      :alt="attachment.file.name"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  Ref,
  PropType
} from '@vue/composition-api'
import { Attachment } from '@/store/ui/fileInput/state'
import Icon from '@/components/UI/Icon.vue'

const useImageThumbnail = (
  props: { attachment: Attachment },
  thumbnailRef: Ref<HTMLImageElement | null>
) => {
  const state = reactive({
    thumbnailDataUrl: computed(() => props.attachment.thumbnailDataUrl),
    width: computed(() => thumbnailRef.value?.naturalHeight)
  })
  return { imageThumbnailState: state }
}

export default defineComponent({
  name: 'MessageInputFileListItemImage',
  components: {
    Icon
  },
  props: {
    attachment: {
      type: Object as PropType<Attachment>,
      required: true
    }
  },
  setup(props) {
    const thumbnailRef = ref<HTMLImageElement>(null)
    const { imageThumbnailState } = useImageThumbnail(props, thumbnailRef)
    return { thumbnailRef, imageThumbnailState }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  max-width: 192px;
  min-width: 48px;
  height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  overflow: hidden;
}
.image {
  height: 100%;
  max-width: none;
}
</style>
