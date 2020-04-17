<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.innerContainer">
      <stamp-picker-stamp-set-selector-item
        v-for="set in stampSets"
        :key="set.id"
        :class="$style.item"
        :stamp-set="set"
        :is-active="currentStampSet.id === set.id"
        @click="onStampSetSelect(set)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { StampSet } from './use/stampSetSelector'
import StampPickerStampSetSelectorItem from './StampPickerStampSetSelectorItem.vue'

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
      type: Object as PropType<StampSet>,
      required: true
    },
    stampSets: {
      type: Array as PropType<StampSet[]>,
      required: true
    },
    foldedStampSets: {
      type: Array as PropType<StampSet[]>,
      default: () => []
    }
  },
  setup(props, context) {
    const onStampSetSelect = (stampSet: StampSet) => {
      context.emit('stamp-set-select', stampSet)
    }
    const styles = useStyles()
    return { styles, onStampSetSelect }
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
