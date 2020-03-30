<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.innerContainer">
      <stamp-picker-stamp-set-selector-item
        v-for="set in props.stampSets"
        :key="set.id"
        :class="$style.item"
        :stamp-set="set"
        :is-active="props.currentStampSet.id === set.id"
        @click="onStampSetSelect(set)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, SetupContext } from '@vue/composition-api'
import store from '@/store'
import { StampPaletteId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildStampImagePath } from '@/lib/api'
import { StampSet } from './use/stampSetSelector'
import StampPickerStampSetSelectorItem from './StampPickerStampSetSelectorItem.vue'
import { StampCategory } from '@/lib/stampCategorizer'

type Props = {
  currentStampSet: StampSet
  stampSets: StampSet[]
  foldedStampSets: StampSet[]
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'StampPickerStampSetSelector',
  components: {
    StampPickerStampSetSelectorItem
  },
  props: {
    currentStampSet: {
      type: Object,
      required: true
    },
    stampSets: {
      type: Array,
      required: true
    },
    foldedStampSets: {
      type: Array,
      default: () => []
    }
  },
  setup(props: Props, context: SetupContext) {
    const onStampSetSelect = (stampSet: StampSet) => {
      context.emit('stamp-set-select', stampSet)
    }
    const styles = useStyles()
    return { props, styles, onStampSetSelect }
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
.item {
  margin: 0 4px;
  &:first-child {
    margin-left: 12px;
  }
  &:last-child {
    padding-right: 8px;
  }
}
</style>
