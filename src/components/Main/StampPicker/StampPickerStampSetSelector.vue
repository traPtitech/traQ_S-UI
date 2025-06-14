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

<script lang="ts" setup>
import StampPickerStampSetSelectorItem from './StampPickerStampSetSelectorItem.vue'
import type { StampSet } from './composables/useStampSetSelector'

const currentStampSet = defineModel<StampSet>('currentStampSet', {
  required: true
})

withDefaults(
  defineProps<{
    stampSets: StampSet[]
    foldedStampSets?: StampSet[]
  }>(),
  {
    foldedStampSets: () => []
  }
)

const onStampSetSelect = (stampSet: StampSet) => {
  currentStampSet.value = stampSet
}
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  position: relative;
  height: fit-content;
}
.innerContainer {
  display: flex;
  align-items: center;
  height: fit-content;
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
