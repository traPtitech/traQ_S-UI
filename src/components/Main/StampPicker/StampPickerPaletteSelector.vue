<template>
  <div :class="$style.container" :style="styles.container">
    <div
      :class="$style.dimmer"
      data-position="left"
      :style="styles.dimmer"
    ></div>
    <div
      :class="$style.dimmer"
      data-position="right"
      :style="styles.dimmer"
    ></div>
    <div :class="$style.innerContainer">
      <stamp-picker-palette-selector-item
        v-for="category in stampSetState.stampPalettes"
        :key="category"
        stamp-set-type="palette"
        :stamp-set="category"
        :class="$style.item"
      />
      <stamp-picker-palette-selector-item
        v-for="category in stampSetState.stampCategories"
        :key="category"
        stamp-set-type="category"
        :stamp-set="category"
        :class="$style.item"
      />
    </div>
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
import StampPickerPaletteSelectorItem from './StampPickerPaletteSelectorItem.vue'
import content from '*.svg'
import { StampCategory } from '@/lib/stampCategorizer'

type Props = {
  stampPaletteId: StampPaletteId
}

const useStampSet = (contrext: SetupContext) => {
  const state = reactive({
    stampCategories: computed(() => [
      store.state.domain.stampCategory.traQStampCategory.name,
      ...store.state.domain.stampCategory.unicodeStampCategories.map(
        c => 'unicode-' + c.name
      )
    ]),
    foldedStampCategories: computed(
      () => store.state.domain.stampCategory.unicodeStampCategories
    ),
    stampPalettes: computed(() =>
      Object.values(store.state.entities.stampPalettes)
    ),
    hasStampPalette: computed((): boolean => state.stampPalettes.length > 0)
  })
  const onStampSetSelect = (stampSet: string, stampSetType: string) => {
    contrext.emit('stamp-set-select', { stampSet, stampSetType })
  }
  return { stampSetState: state }
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    })),
    dimmer: makeStyles(theme => ({
      background: `linear-gradient(to left, ${theme.background.secondary}, transparent)`
    }))
  })

export default defineComponent({
  name: 'StampPickerPaletteSelector',
  components: {
    StampPickerPaletteSelectorItem
  },
  props: {
    stampPaletteId: {
      type: String,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const { stampSetState } = useStampSet(context)
    const styles = useStyles()
    return { stampSetState, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  width: 100%;
  height: 36px;
}
.innerContainer {
  display: flex;
  align-items: center;
  height: 100%;
  overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}
.dimmer {
  position: absolute;
  width: 8px;
  height: 100%;
  top: 0;
  &[data-position='left'] {
    transform: rotate(180deg);
    left: 0;
  }
  &[data-position='right'] {
    right: 0;
  }
}
.item {
  margin: 0 4px;
}
</style>
