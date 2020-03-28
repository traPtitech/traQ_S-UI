<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.inputContainer">
      <filter-input
        :text="regexpFilterState.query"
        @input="setQuery"
        placeholder="スタンプを検索"
      />
    </div>
    <stamp-picker-stamp-list
      :class="$style.stampList"
      :stamps="regexpFilterState.filteredItems"
      @input-stamp="onInputStamp"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useRegexpFilter from '@/use/regexpFilter'
import FilterInput from '@/components/UI/FilterInput.vue'
import StampPickerStampList from './StampPickerStampList.vue'
import { StampId } from '@/types/entity-ids'

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
  return { state, onInputStamp }
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'StampPicker',
  components: {
    FilterInput,
    StampPickerStampList
  },
  setup() {
    const styles = useStyles()
    const { state, onInputStamp } = useStampPicker()
    const stamps = computed(() => store.getters.ui.stampPicker.stamps)
    const { regexpFilterState, setQuery } = useRegexpFilter(stamps, 'name')
    return { state, stamps, regexpFilterState, setQuery, styles, onInputStamp }
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
  padding: 8px;
  display: flex;
  flex-direction: column;
  border: {
    style: solid;
    width: 2px;
  }
}
.inputContainer {
  flex-shrink: 0;
}
.stampList {
  padding: 12px 0;
}
</style>
