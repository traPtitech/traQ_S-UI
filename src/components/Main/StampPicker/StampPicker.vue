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
        :current-stamp-set="state.currentStampSet"
        @stamp-set-select="setCurrentStampSet"
      />
    </div>
  </click-outside>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import store from '/@/vuex'
import { StampId } from '/@/types/entity-ids'
import ClickOutside from '/@/components/UI/ClickOutside'
import FilterInput from '/@/components/UI/FilterInput.vue'
import useStampList from './use/stampList'
import useStampSetSelector from './use/stampSetSelector'
import useEffectSelector from './use/effectSelector'
import useStampFilterPlaceholder from './use/stampFilterPlaceholder'
import StampPickerStampList from './StampPickerStampList.vue'
import StampPickerStampSetSelector from './StampPickerStampSetSelector.vue'
//import StampPickerEffectSelector from './StampPickerEffectSelector.vue'
//import StampPickerEffectToggleButton from './StampPickerEffectToggleButton.vue'
import { useStampPickerStore } from '/@/providers/stampPicker'

export default defineComponent({
  name: 'StampPicker',
  components: {
    ClickOutside,
    FilterInput,
    StampPickerStampList,
    StampPickerStampSetSelector
    //StampPickerEffectSelector,
    //StampPickerEffectToggleButton
  },
  setup() {
    const { state, setCurrentStampSet, closeStampPicker } =
      useStampPickerStore()
    const currentStampSet = computed(() => state.currentStampSet)
    const queryString = ref('')

    const { stamps, filterState } = useStampList(currentStampSet)
    const { stampSetState } = useStampSetSelector()
    const { effectSelectorState, toggleShowEffect } = useEffectSelector()
    const { placeholder, onHoverStamp } = useStampFilterPlaceholder()

    const onInputStamp = (id: StampId) => {
      store.commit.domain.me.upsertLocalStampHistory({
        stampId: id,
        datetime: new Date()
      })
      state.selectHandler({
        id
      })
    }
    const onFilterEnter = () => {
      const firstStamp = stamps.value[0]
      if (!firstStamp) return
      onInputStamp(firstStamp.id)
    }

    return {
      state,
      stampSetState,
      effectSelectorState,
      stamps,
      queryString,
      filterState,
      placeholder,
      onFilterEnter,
      onInputStamp,
      onHoverStamp,
      closeStampPicker,
      toggleShowEffect,
      setCurrentStampSet
    }
  }
})
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
