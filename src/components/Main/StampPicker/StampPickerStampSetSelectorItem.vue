<template>
  <div
    :class="$style.container"
    :style="styles.container"
    @click="context.emit('click')"
  >
    <div
      v-if="props.isActive"
      :class="$style.indicator"
      :style="styles.indicator"
    ></div>
    <stamp
      v-if="props.stampSet.type === 'palette'"
      :stamp-id="pickThumbnail(props.stampSet.id)"
      :size="24"
      :style="styles.paletteStamp"
    />
    <icon
      v-else-if="props.stampSet.type === 'category'"
      :name="`stampCategory/${props.stampSet.id}`"
      :size="24"
      :style="styles.icon"
    />
    <icon
      v-else-if="props.stampSet.type === 'history'"
      mdi
      name="history"
      :size="24"
      :style="styles.icon"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { StampPaletteId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildStampImagePath } from '@/lib/api'
import Icon from '@/components/UI/Icon.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { StampSet } from './use/stampSetSelector'

type Props = {
  stampSet: StampSet
  isActive: boolean
}

const useStyles = (props: Props) =>
  reactive({
    container: makeStyles(theme => ({
      color: props.isActive ? theme.accent.primary : theme.ui.secondary
    })),
    indicator: makeStyles(theme => ({
      background: theme.accent.primary
    })),
    icon: makeStyles(theme => ({
      opacity: props.isActive ? '1' : '0.5'
    })),
    paletteStamp: makeStyles(theme => ({
      filter: props.isActive ? '' : 'grayscale()'
    }))
  })

const useStampPaletteThumbnail = () => {
  const pickThumbnail = (paletteId: StampPaletteId) => {
    const palette = store.state.entities.stampPalettes[paletteId]
    if ((palette?.stamps?.length ?? 0) > 0) {
      return palette.stamps[0]
    }
    return ''
  }
  return { pickThumbnail }
}

export default defineComponent({
  name: 'StampPickerStampSetSelectorItem',
  components: {
    Icon,
    Stamp
  },
  props: {
    stampSet: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles(props)
    const { pickThumbnail } = useStampPaletteThumbnail()
    return { props, context, styles, pickThumbnail }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  height: 36px;
  cursor: pointer;
}
.indicator {
  position: absolute;
  width: 32px;
  height: 2px;
  bottom: 0;
  left: -4px;
}
</style>
