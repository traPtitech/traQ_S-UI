<template>
  <div :class="$style.container" :style="styles.container">
    <message-file-list-item-content :file-id="fileId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from '@vue/composition-api'
import { FileId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
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
      type: String as PropType<FileId>,
      default: ''
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
