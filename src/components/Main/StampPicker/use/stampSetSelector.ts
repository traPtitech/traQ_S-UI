import { reactive, computed } from '@vue/composition-api'
import store from '@/store'

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
      ...state.stampCategories,
      ...state.stampPalettes
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
      Object.keys(store.state.entities.stampPalettes).map(id => ({
        type: 'palette',
        id
      }))
    ),
    hasStampPalette: computed((): boolean => state.stampPalettes.length > 0)
  })
  return { stampSetState: state }
}

export default useStampSetSelector
