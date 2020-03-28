<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.inputContainer">
      <filter-input
        :text="regexpFilterState.query"
        @input="setQuery"
        placeholder="スタンプを検索"
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
    />
    <stamp-picker-effect-selector
      :class="$style.effectSelector"
      v-if="effectSelectorState.shouldShowEffectSelector"
    />
    <stamp-picker-palette-selector :class="$style.paletteSelector" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { StampId } from '@/types/entity-ids'
import useRegexpFilter from '@/use/regexpFilter'
import Icon from '@/components/UI/Icon.vue'
import FilterInput from '@/components/UI/FilterInput.vue'
import StampPickerStampList from './StampPickerStampList.vue'
import StampPickerPaletteSelector from './StampPickerPaletteSelector.vue'
import StampPickerEffectSelector from './StampPickerEffectSelector.vue'
import { transparentize } from '../../../lib/util/color'

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

type EffectSelectorState = {
  shouldShowEffectSelector: boolean
}

const useEffectSelector = () => {
  const state: EffectSelectorState = reactive({
    shouldShowEffectSelector: false
  })
  const toggleShowEffect = () => {
    state.shouldShowEffectSelector = !state.shouldShowEffectSelector
  }
  return { effectSelectorState: state, toggleShowEffect }
}

const useStyles = (effectSelectorState: EffectSelectorState) =>
  reactive({
    container: makeStyles(theme => ({
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
    StampPickerPaletteSelector,
    StampPickerEffectSelector
  },
  setup() {
    const { stampPickerState, onInputStamp } = useStampPicker()
    const { effectSelectorState, toggleShowEffect } = useEffectSelector()
    const stamps = computed(() => store.getters.ui.stampPicker.stamps)
    const { regexpFilterState, setQuery } = useRegexpFilter(stamps, 'name')

    const styles = useStyles(effectSelectorState)

    return {
      stampPickerState,
      effectSelectorState,
      regexpFilterState,
      stamps,
      setQuery,
      onInputStamp,
      toggleShowEffect,
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
