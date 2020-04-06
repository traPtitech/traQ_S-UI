<template>
  <div
    :class="$style.container"
    :style="styles.container"
    @click="context.emit('click')"
  >
    <div
      v-if="isActive"
      :class="$style.indicator"
      :style="styles.indicator"
    ></div>
    <stamp
      v-if="stampSet.type === 'palette'"
      :stamp-id="pickThumbnail(stampSet.id)"
      :size="24"
      :style="styles.paletteStamp"
    />
    <icon
      v-else-if="stampSet.type === 'category'"
      :name="`stampCategory/${stampSet.id}`"
      :size="24"
      :style="styles.icon"
    />
    <icon
      v-else-if="stampSet.type === 'history'"
      mdi
      name="history"
      :size="24"
      :style="styles.icon"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import store from '@/store'
import { StampPaletteId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildFilePath } from '@/lib/api'
import Icon from '@/components/UI/Icon.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { StampSet } from './use/stampSetSelector'

const useStyles = (props: { isActive: boolean }) =>
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
      type: Object as PropType<StampSet>,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { pickThumbnail } = useStampPaletteThumbnail()
    return { context, styles, pickThumbnail }
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
