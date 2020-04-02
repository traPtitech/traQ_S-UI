<template>
  <div :class="$style.container" :style="styles.container">
    <div>
      {{ fileId }}
    </div>
    <div>
      {{ fileName }}
    </div>
    <div>
      {{ fileType }}
    </div>
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
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MessageFileListItem',
  props: {
    fileId: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    fileType: {
      type: String as PropType<AttachmentType>,
      default: 'file' as AttachmentType
    }
  },
  setup(props) {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 64px;
  width: 100%;
  max-width: 400px;
  border: {
    style: solid;
    width: 2px;
  }
  overflow: hidden;
}
</style>
