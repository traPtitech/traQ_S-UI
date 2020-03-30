<template>
  <div :class="$style.container" :style="styles.container">
    <img
      :ref="thumbnailRef"
      :class="$style.image"
      :src="imageThumbnailState.thumbnailDataUrl"
      :alt="props.attachment.file.name"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive,
  ref,
  Ref
} from '@vue/composition-api'
import store from '@/store'
import { Attachment } from '@/store/ui/fileInput/state'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'

type Props = {
  attachment: Attachment
}

const useImageThumbnail = (
  props: Props,
  thumbnailRef: Ref<HTMLImageElement | null>
) => {
  const state = reactive({
    thumbnailDataUrl: computed(() => props.attachment.thumbnailDataUrl),
    width: computed(() => thumbnailRef.value?.naturalHeight)
  })
  return { imageThumbnailState: state }
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'MessageInputFileListItemImage',
  components: {
    Icon
  },
  props: {
    attachment: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const thumbnailRef = ref<HTMLImageElement>(null)
    const { imageThumbnailState } = useImageThumbnail(props, thumbnailRef)
    const styles = useStyles()
    return { thumbnailRef, props, styles, imageThumbnailState }
  }
})
</script>

<style lang="scss" module>
.container {
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
