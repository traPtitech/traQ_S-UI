import { reactive, computed } from 'vue'
import store from '@/_store'

export type StampSetType = 'palette' | 'category' | 'history'

export type StampSet = {
  type: StampSetType

  /** スタンプカテゴリ名かスタンプパレットID */
  id: string
}

const useStampSetSelector = () => {
  const state = reactive({
    currentStampSet: computed(() => store.state.ui.stampPicker.currentStampSet),
    stampSets: computed((): StampSet[] => [
      {
        type: 'history',
        id: ''
      },
      ...state.stampPalettes,
      ...state.stampCategories
    ]),
    stampCategories: computed((): StampSet[] => [
      {
        type: 'category',
        id: store.state.domain.stampCategory.traQStampCategory.name
      },
      ...state.foldedStampSets
    ]),
    foldedStampSets: computed((): StampSet[] =>
      store.state.domain.stampCategory.unicodeStampCategories.map(c => ({
        type: 'category',
        id: 'unicode-' + c.name
      }))
    ),
    stampPalettes: computed((): StampSet[] =>
      store.getters.entities.nonEmptyStampPaletteIds.map(id => ({
        type: 'palette',
        id
      }))
    ),
    hasStampPalette: computed((): boolean => state.stampPalettes.length > 0)
  })
  const changeStampSet = (stampSet: StampSet) =>
    store.commit.ui.stampPicker.setCurrentStampSet(stampSet)
  return { stampSetState: state, changeStampSet }
}

export default useStampSetSelector
