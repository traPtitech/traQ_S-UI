<template>
  <div
    @click="context.emit('click')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :style="styles.container"
  >
    <stamp :stamp-id="stampId" :size="size" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import useHover, { HoverState } from '@/use/hover'
import { buildFilePath } from '@/lib/api'
import Stamp from '@/components/UI/Stamp.vue'

const useStyles = (hoverState: HoverState) =>
  reactive({
    container: makeStyles(theme => ({
      background: hoverState.hover ? theme.background.secondary : ''
    }))
  })

export default defineComponent({
  name: 'StampPickerStampListItem',
  components: {
    Stamp
  },
  props: {
    stampId: {
      type: String as PropType<StampId>,
      required: true
    },
    size: { type: Number, default: 24 }
  },
  setup(props, context) {
    const fileId = store.state.entities.stamps[props.stampId]?.fileId ?? ''
    const imageUrl = fileId ? `${buildFilePath(fileId)}` : ''
    const { hoverState, onMouseEnter, onMouseLeave } = useHover(context, true)
    const styles = useStyles(hoverState)
    return { context, imageUrl, onMouseEnter, onMouseLeave, styles }
  }
})
</script>
