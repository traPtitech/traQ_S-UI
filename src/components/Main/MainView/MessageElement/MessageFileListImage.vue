<template>
  <div
    v-if="$props.isLarge"
    :class="$style.largeContainer"
    :style="styles.container"
  >
    <img draggable="false" :src="imagePath" />
  </div>
  <div v-else :class="$style.container" :style="styles.container">
    <img draggable="false" :src="imagePath" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  reactive,
  onBeforeMount
} from '@vue/composition-api'
import { FileId } from '@/types/entity-ids'
import { AttachmentType } from '@/lib/util/fileType'
import { buildFileThumbnailPath, buildFilePath } from '@/lib/api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MessageFileListItem',
  props: {
    isLarge: {
      type: Boolean,
      default: false
    },
    fileId: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const imagePath = computed(() =>
      props.isLarge
        ? buildFilePath(props.fileId)
        : buildFileThumbnailPath(props.fileId)
    )
    const styles = useStyles()
    return { imagePath, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 240px;
  height: 160px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: {
    width: 2px;
    style: solid;
  }
  img {
    cursor: pointer;
  }
}
.largeContainer {
  border-radius: 6px;
  overflow: hidden;
  border: {
    width: 2px;
    style: solid;
  }
  img {
    max-width: min(600px, 100%);
    max-height: 450px;
    cursor: pointer;
  }
}
</style>
