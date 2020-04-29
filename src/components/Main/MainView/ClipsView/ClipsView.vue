<template>
  <div :class="$style.container" :style="styles.container">
    <clips-view-content :clip-folder-id="clipFolderId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { ClipFolderId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import ClipsViewContent from './ClipsViewContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ClipsView',
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  components: { ClipsViewContent },
  setup() {
    const styles = useStyles()
    return {
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
