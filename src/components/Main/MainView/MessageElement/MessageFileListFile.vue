<template>
  <div :class="$style.container" :style="styles.container">
    <message-file-list-item-content :fileId="$props.fileId" />
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
import { AttachmentType } from '@/lib/util/file'
import { makeStyles } from '@/lib/styles'
import { prettifyFileSize } from '@/lib/util/file'
import useFileLink from './use/fileLink'
import MessageFileListItemContent from './MessageFileListItemContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MessageFileListFile',
  components: { MessageFileListItemContent },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  height: 64px;
  width: 100%;
  max-width: 400px;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
  }
  overflow: hidden;
  cursor: pointer;
}
</style>
