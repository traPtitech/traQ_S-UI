<template>
  <icon :name="iconData.name" :mdi="iconData.mdi" :size="size" />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { AttachmentType } from '/@/lib/util/file'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'FileTypeIcon',
  components: {
    Icon
  },
  props: {
    type: {
      type: String as PropType<AttachmentType>,
      required: true
    },
    size: {
      type: Number,
      default: undefined
    },
    isAnimatedImage: {
      type: Boolean,
      default: false
    }
  },
  setup(prop) {
    const iconData = computed(() => {
      switch (prop.type) {
        case 'file':
          return { name: 'file', mdi: true }
        case 'pdf':
          return { name: 'file-pdf', mdi: false }
        case 'slide':
          return { name: 'file-chart', mdi: true }
        case 'image':
          return {
            name: prop.isAnimatedImage ? 'image-multiple' : 'file-image',
            mdi: true
          }
        case 'video':
          return { name: 'file-video', mdi: true }
        case 'audio':
          return { name: 'file-music', mdi: true }
      }
      const check: never = prop.type
      throw new Error(`Unexpected type ${check}`)
    })
    return { iconData }
  }
})
</script>
