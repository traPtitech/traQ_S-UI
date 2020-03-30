<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.inputContainer">
      <filter-input
        :text="regexpFilterState.query"
        @input="setQuery"
        :placeholder="placeholder"
      />
      <div
        :class="$style.effectButton"
        :style="styles.effectButton"
        @click="toggleShowEffect"
      >
        <icon name="effect" />
      </div>
    </div>
    <stamp-picker-stamp-list
      :class="$style.stampList"
      :stamps="regexpFilterState.filteredItems"
      @input-stamp="onInputStamp"
      @hover-stamp="onHoverStamp"
    />
    <stamp-picker-effect-selector
      :class="$style.effectSelector"
      v-if="effectSelectorState.shouldShowEffectSelector"
    />
    <stamp-picker-stamp-set-selector
      :class="$style.paletteSelector"
      :stamp-sets="stampSetState.stampSets"
      :current-stamp-set="stampSetState.currentStampSet"
      @stamp-set-select="changeStampSet"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import { StampId } from '@/types/entity-ids'
import useRegexpFilter from '@/use/regexpFilter'
import Icon from '@/components/UI/Icon.vue'
import FilterInput from '@/components/UI/FilterInput.vue'
import useStampSetSelector from './use/stampSetSelector'
import useEffectSelector, { EffectSelectorState } from './use/effectSelector'
import useStampFilterPlaceholder from './use/stampFilterPlaceholder'
import StampPickerStampList from './StampPickerStampList.vue'
import StampPickerStampSetSelector from './StampPickerStampSetSelector.vue'
import StampPickerEffectSelector from './StampPickerEffectSelector.vue'

import api from '@/lib/api'

const useStampPicker = () => {
  const state = reactive({
    targetPortalName: computed(
      () => store.state.ui.stampPicker.targetPortalName
    ),
    shouldShowStampPicker: computed(
      () => store.getters.ui.stampPicker.shouldShowStampPicker
    )
  })
  const onInputStamp = (id: StampId) => {
    store.state.ui.stampPicker.selectHandler({
      id
    })
    store.dispatch.ui.stampPicker.closeStampPicker()
  }
  return { stampPickerState: state, onInputStamp }
}

const useStyles = (effectSelectorState: EffectSelectorState) =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      borderColor: theme.background.secondary
    })),
    effectButton: makeStyles(theme => ({
      background: theme.background.secondary,
      color: effectSelectorState.shouldShowEffectSelector
        ? theme.accent.primary
        : transparentize(theme.ui.secondary, 0.5),
      borderColor: effectSelectorState.shouldShowEffectSelector
        ? theme.accent.primary
        : 'transparent'
    }))
  })

export default defineComponent({
  name: 'StampPicker',
  components: {
    Icon,
    FilterInput,
    StampPickerStampList,
    StampPickerStampSetSelector,
    StampPickerEffectSelector
  },
  setup() {
    const stamps = computed(() =>
      store.getters.ui.stampPicker.stampIds.map(
        id => store.state.entities.stamps[id]
      )
    )
    const { stampPickerState, onInputStamp } = useStampPicker()
    const { stampSetState, changeStampSet } = useStampSetSelector()
    const { effectSelectorState, toggleShowEffect } = useEffectSelector()
    const { regexpFilterState, setQuery } = useRegexpFilter(stamps, 'name')
    const { placeholder, onHoverStamp } = useStampFilterPlaceholder()

    const styles = useStyles(effectSelectorState)

    return {
      stampSetState,
      stampPickerState,
      effectSelectorState,
      regexpFilterState,
      stamps,
      setQuery,
      placeholder,
      onInputStamp,
      onHoverStamp,
      toggleShowEffect,
      changeStampSet,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
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
  }
}
.inputContainer {
  margin: 8px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 40px;
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
