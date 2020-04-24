<template>
  <div ref="containerRef" :class="$style.container" :style="styles.container">
    くりっぷ {{ clipFolder }}
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { ClipFolderId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

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
  components: {},
  setup(props) {
    const messageIds = computed(
      () => store.state.domain.messagesView.messageIds
    )
    const clipFolder = computed(
      () => store.state.entities.clipFolders?.[props.clipFolderId]
    )

    const styles = useStyles()

    return {
      messageIds,
      clipFolder,
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
