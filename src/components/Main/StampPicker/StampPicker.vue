<template>
  <click-outside @click-outside="closeStampPicker">
    <div :class="$style.container">
      <div :class="$style.inputContainer">
        <filter-input
          v-model="filterState.query"
          :placeholder="placeholder"
          disable-ime
          focus-on-mount
          @enter="onFilterEnter"
        />
        <!--
          <stamp-picker-effect-toggle-button
            :isActive="effectSelectorState.shouldShowEffectSelector"
            @click="toggleShowEffect"
          />
        -->
      </div>
      <stamp-picker-stamp-list
        :class="$style.stampList"
        :stamps="stamps"
        :animation-keys="animationKeys"
        @input-stamp="onInputStamp"
        @hover-stamp="onHoverStamp"
      />
      <!--
        <stamp-picker-effect-selector
          :class="$style.effectSelector"
          v-if="effectSelectorState.shouldShowEffectSelector"
        />
      -->
      <stamp-picker-stamp-set-selector
        v-model:current-stamp-set="currentStampSet"
        :class="$style.paletteSelector"
        :stamp-sets="stampSetState.stampSets"
      />
    </div>
  </click-outside>
</template>

<script lang="ts" setup>
import ClickOutside from '/@/components/UI/ClickOutside'
import FilterInput from '/@/components/UI/FilterInput.vue'
import StampPickerStampList from './StampPickerStampList.vue'
import StampPickerStampSetSelector from './StampPickerStampSetSelector.vue'
import type { StampId } from '/@/types/entity-ids'
import useStampList from './composables/useStampList'
import useStampSetSelector from './composables/useStampSetSelector'
import useEffectSelector from './composables/useEffectSelector'
import useStampFilterPlaceholder from './composables/useStampFilterPlaceholder'
//import StampPickerEffectSelector from './StampPickerEffectSelector.vue'
//import StampPickerEffectToggleButton from './StampPickerEffectToggleButton.vue'
import { useStampPicker } from '/@/store/ui/stampPicker'
import { ref } from 'vue'
import { useStampHistory } from '/@/store/domain/stampHistory'

const { selectHandler, currentStampSet, closeStampPicker } = useStampPicker()
const { upsertLocalStampHistory } = useStampHistory()

const animationKeys = ref(new Map<StampId, number>())
const incrementAnimationKey = (id: StampId) => {
  const currentVal = animationKeys.value.get(id) ?? 0
  animationKeys.value.set(id, currentVal + 1)
}

const { stamps, filterState } = useStampList(currentStampSet)
const { stampSetState } = useStampSetSelector()

const { shouldShowEffectSelector, toggleShowEffect } = useEffectSelector()
const { placeholder, onHoverStamp } = useStampFilterPlaceholder()

const onInputStamp = (id: StampId) => {
  upsertLocalStampHistory(id, new Date())
  selectHandler.value({ id })
  incrementAnimationKey(id)
}
const onFilterEnter = () => {
  const firstStamp = stamps.value[0]
  if (!firstStamp) return
  onInputStamp(firstStamp.id)
}
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  width: 100%;
  height: 320px;
  max-width: 340px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: {
    style: solid;
    width: 2px;
    color: $theme-background-secondary-border;
  }
}
.inputContainer {
  margin: 8px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr /* 40px */;
  gap: 8px;
}
.paletteSelector,
.effectSelector {
  flex-shrink: 0;
}
.stampList {
  margin: 0 8px;
  padding-bottom: 12px;
}
.effectButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border: {
    radius: 4px;
    width: 2px;
    style: solid;
  }
  cursor: pointer;
}
</style>
