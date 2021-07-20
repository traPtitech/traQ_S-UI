<template>
  <icon mdi :name="iconName" :size="size" />
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
    size: Number,
    isAnimatedImage: {
      type: Boolean,
      default: false
    }
  },
  setup(prop) {
    const iconName = computed(() => {
      switch (prop.type) {
        case 'file':
          return 'file'
        case 'pdf':
          return 'file-pdf'
        case 'slide':
          return 'file-chart'
        case 'image':
          return prop.isAnimatedImage ? 'image-multiple' : 'file-image'
        case 'video':
          return 'file-video'
        case 'audio':
          return 'file-music'
      }
      throw new Error(`Unexpected type ${prop.type}`)
    })
    return { iconName }
  }
})
</script>
