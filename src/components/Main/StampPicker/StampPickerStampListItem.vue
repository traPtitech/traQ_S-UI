<template>
  <div
    @click="context.emit('click')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :class="$style.container"
    :style="styles.container"
  >
    <stamp :stamp-id="props.stampId" :size="24" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, SetupContext } from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import useHover, { HoverState } from '@/use/hover'
import { buildFilePath } from '@/lib/api'
import Stamp from '@/components/UI/Stamp.vue'

type Props = {
  stampId: StampId
}

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
      type: String,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const fileId = store.state.entities.stamps[props.stampId]?.fileId ?? ''
    const imageUrl = fileId ? `${buildFilePath(fileId)}` : ''
    const { hoverState, onMouseEnter, onMouseLeave } = useHover(context, true)
    const styles = useStyles(hoverState)
    return { props, context, imageUrl, onMouseEnter, onMouseLeave, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 32px;
  height: 32px;
  padding: 4px;
  cursor: pointer;
  user-select: none;
}
</style>
