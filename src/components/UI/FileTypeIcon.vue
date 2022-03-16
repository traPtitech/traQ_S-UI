<template>
  <a-icon :name="iconData.name" :mdi="iconData.mdi" :size="size" />
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import { AttachmentType } from '/@/lib/basic/file'

const props = withDefaults(
  defineProps<{
    type: AttachmentType
    size?: number
    isAnimatedImage?: boolean
  }>(),
  {
    isAnimatedImage: false
  }
)

const iconData = computed(() => {
  switch (props.type) {
    case 'file':
      return { name: 'file', mdi: true }
    case 'pdf':
      return { name: 'file-pdf', mdi: false }
    case 'slide':
      return { name: 'file-chart', mdi: true }
    case 'image':
      return {
        name: props.isAnimatedImage ? 'image-multiple' : 'file-image',
        mdi: true
      }
    case 'video':
      return { name: 'file-video', mdi: true }
    case 'audio':
      return { name: 'file-music', mdi: true }
  }
  const check: never = props.type
  throw new Error(`Unexpected type ${check}`)
})
</script>
