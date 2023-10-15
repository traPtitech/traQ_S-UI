<template>
  <click-outside @click-outside="closeStampPicker">
    <div :class="$style.container">
      <div :class="$style.inputContainer">
        <filter-input
          ref="filterInputRef"
          v-model="filterState.query"
          :class="$style.filterInput"
          placeholder="スタンプを検索"
          disable-ime
          focus-on-mount
          @enter="onFilterEnter"
        />
        <stamp-picker-effect-toggle-button
          v-if="isEffectEnabled"
          :class="$style.effectButton"
          :is-active="shouldShowEffectSelector"
          :has-effect="hasEffect"
          @click="toggleShowEffect"
        />
      </div>
      <stamp-picker-stamp-list
        v-show="!shouldShowEffectSelector"
        :class="$style.stampList"
        :stamps="stamps"
        :animation-keys="animationKeys"
        @input-stamp="onInputStamp"
        @hover-stamp="onHoverStamp"
      />
      <stamp-picker-effect-selector
        v-if="shouldShowEffectSelector"
        v-model:size-effect="selectedSizeEffect"
        v-model:anime-effects="selectedAnimeEffects"
        :class="$style.effectSelector"
      />
      <stamp-picker-preview
        :stamp-id="preselected"
        :size-effect="selectedSizeEffect"
        :anime-effects="selectedAnimeEffects"
      />
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
import useStampPreselector from './composables/useStampPreselector'
import StampPickerEffectSelector from './StampPickerEffectSelector.vue'
import StampPickerEffectToggleButton from './StampPickerEffectToggleButton.vue'
import StampPickerPreview from './StampPickerPreview.vue'
import { useStampPicker } from '/@/store/ui/stampPicker'
import { ref } from 'vue'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useResponsiveStore } from '/@/store/ui/responsive'

const { selectHandler, isEffectEnabled, currentStampSet, closeStampPicker } =
  useStampPicker()
const { upsertLocalStampHistory } = useStampHistory()
const { isMobile } = useResponsiveStore()

const animationKeys = ref(new Map<StampId, number>())
const incrementAnimationKey = (id: StampId) => {
  const currentVal = animationKeys.value.get(id) ?? 0
  animationKeys.value.set(id, currentVal + 1)
}

const { stamps, filterState } = useStampList(currentStampSet)
const { stampSetState } = useStampSetSelector()

const {
  shouldShowEffectSelector,
  selectedSizeEffect,
  selectedAnimeEffects,
  hasEffect,
  toggleShowEffect
} = useEffectSelector()
const { preselected, onHoverStamp } = useStampPreselector()

const filterInputRef = ref<InstanceType<typeof FilterInput> | null>(null)

const onInputStamp = (id: StampId) => {
  upsertLocalStampHistory(id, new Date())
  selectHandler.value({
    id,
    sizeEffect: selectedSizeEffect.value,
    animeEffects: selectedAnimeEffects.value
  })
  incrementAnimationKey(id)

  if (!isMobile.value) {
    filterInputRef.value?.focus()
  }
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
  display: flex;
  margin: 8px;
  flex-shrink: 0;
}
.filterInput {
  flex-grow: 1;
}
.effectButton {
  margin-left: 8px;
}
.stampList {
  padding: 0 4px;
  padding-bottom: 12px;
}
.effectSelector {
  flex: 1 0;
}
.paletteSelector {
  flex-shrink: 0;
}
</style>
