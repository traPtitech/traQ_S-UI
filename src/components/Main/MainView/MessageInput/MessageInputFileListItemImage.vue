<template>
  <div :class="$style.container">
    <img
      ref="thumbnailRef"
      :class="$style.image"
      :src="imageThumbnailState.thumbnailDataUrl"
      :alt="attachment.file.name"
    />
  </div>
</template>

<script lang="ts">
import { Attachment } from '/@/store/ui/messageInputState'
import { computed, reactive, Ref, shallowRef } from 'vue'

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
</script>

<script lang="ts" setup>
const props = defineProps<{
  attachment: Attachment
}>()

const thumbnailRef = shallowRef<HTMLImageElement | null>(null)
const { imageThumbnailState } = useImageThumbnail(props, thumbnailRef)
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
