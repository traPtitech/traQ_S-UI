<template>
  <div :class="$style.container" :style="styles.container">
    <filter-input
      :text="regexpFilterState.query"
      @input="setQuery"
      placeholder="スタンプを検索"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useRegexpFilter from '@/use/regexpFilter'
import FilterInput from '@/components/UI/FilterInput.vue'

const useStampPicker = () => {
  const state = reactive({
    targetPortalName: computed(
      () => store.state.ui.stampPicker.targetPortalName
    ),
    shouldShowStampPicker: computed(
      () => store.getters.ui.stampPicker.shouldShowStampPicker
    )
  })
  return { state }
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
    FilterInput
  },
  setup() {
    const styles = useStyles()
    const { state } = useStampPicker()
    const { regexpFilterState, setQuery } = useRegexpFilter(
      ref([
        { id: 'a', name: 'name a' },
        { id: 'b', name: 'name b' }
      ]),
      'name'
    )
    return { state, regexpFilterState, setQuery, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 224px;
  max-width: 336px;
  border-radius: 4px;
  overflow: hidden;
  padding: 8px;
  border: {
    style: solid;
    width: 2px;
  }
}
</style>
