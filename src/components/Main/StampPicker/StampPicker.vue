<template>
  <div
    :class="$style.container"
    :style="styles.container"
    v-click-outside="onClickOutside"
  >
    <div :class="$style.inputContainer">
      <filter-input
        :text="textFilterState.query"
        @input="setQuery"
        :placeholder="placeholder"
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
import { StampId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'
import FilterInput from '@/components/UI/FilterInput.vue'
import useStampList from './use/stampList'
import useStampSetSelector from './use/stampSetSelector'
import useEffectSelector, { EffectSelectorState } from './use/effectSelector'
import useStampFilterPlaceholder from './use/stampFilterPlaceholder'
import StampPickerStampList from './StampPickerStampList.vue'
import StampPickerStampSetSelector from './StampPickerStampSetSelector.vue'
import StampPickerEffectSelector from './StampPickerEffectSelector.vue'
import StampPickerEffectToggleButton from './StampPickerEffectToggleButton.vue'

const useStampPicker = () => {
  const state = reactive({
    targetPortalName: computed(
      () => store.state.ui.stampPicker.targetPortalName
    ),
    shouldShowStampPicker: computed(
      () => store.getters.ui.stampPicker.isStampPickerShown
    )
  })
  const onInputStamp = (id: StampId) => {
    store.commit.domain.me.upsertLocalStampHistory({
      stampId: id,
      datetime: new Date()
    })
    store.state.ui.stampPicker.selectHandler({
      id
    })
  }
  return { stampPickerState: state, onInputStamp }
}

const useStyles = (effectSelectorState: EffectSelectorState) =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      borderColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'StampPicker',
  components: {
    Icon,
    FilterInput,
    StampPickerStampList,
    StampPickerStampSetSelector,
    StampPickerEffectSelector,
    StampPickerEffectToggleButton
  },
  setup() {
    const currentStampSet = computed(
      () => store.state.ui.stampPicker.currentStampSet
    )
    const queryString = ref('')

    const { stamps, textFilterState, setQuery } = useStampList(currentStampSet, queryString)
    const { stampPickerState, onInputStamp } = useStampPicker()
    const { stampSetState, changeStampSet } = useStampSetSelector()
    const { effectSelectorState, toggleShowEffect } = useEffectSelector()
    const { placeholder, onHoverStamp } = useStampFilterPlaceholder()

    const styles = useStyles(effectSelectorState)

    const onClickOutside = () =>
      store.dispatch.ui.stampPicker.closeStampPicker()
    return {
      stampSetState,
      stampPickerState,
      effectSelectorState,
      stamps,
      queryString,
      updateQueryString,
      placeholder,
      onInputStamp,
      onHoverStamp,
      onClickOutside,
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
