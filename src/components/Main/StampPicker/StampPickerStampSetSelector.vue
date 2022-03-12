<template>
  <div :class="$style.container">
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
import { defineComponent, PropType } from 'vue'
import { StampSet } from './use/stampSetSelector'
import StampPickerStampSetSelectorItem from './StampPickerStampSetSelectorItem.vue'

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
  emits: {
    'update:currentStampSet': (_stampSet: StampSet) => true
  },
  setup(props, { emit }) {
    const onStampSetSelect = (stampSet: StampSet) => {
      emit('update:currentStampSet', stampSet)
    }
    return { onStampSetSelect }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  position: relative;
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
  flex-shrink: 0;
  margin: 0 4px;
  &:first-child {
    margin-left: 12px;
  }
  &:last-child {
    padding-right: 8px;
  }
}
</style>
