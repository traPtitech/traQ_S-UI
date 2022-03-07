import { reactive, computed } from 'vue'
import store from '/@/vuex'

export type StampSetType = 'palette' | 'category' | 'history'

export type StampSet = {
  type: StampSetType

  /** スタンプカテゴリ名かスタンプパレットID */
  id: string
}

const useStampSetSelector = () => {
  const state = reactive({
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

  return { stampSetState: state }
}

export default useStampSetSelector
