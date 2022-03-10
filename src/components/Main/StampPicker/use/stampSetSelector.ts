import { reactive, computed } from 'vue'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'

export type StampSetType = 'palette' | 'category' | 'history'

export type StampSet = {
  type: StampSetType

  /** スタンプカテゴリ名かスタンプパレットID */
  id: string
}

const useStampSetSelector = () => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { nonEmptyStampPaletteIds } = useStampPalettesStore()

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
        id: traQStampCategory.value.name
      },
      ...state.foldedStampSets
    ]),
    foldedStampSets: computed((): StampSet[] =>
      unicodeStampCategories.value.map(c => ({
        type: 'category',
        id: 'unicode-' + c.name
      }))
    ),
    stampPalettes: computed((): StampSet[] =>
      nonEmptyStampPaletteIds.value.map(id => ({
        type: 'palette',
        id
      }))
    ),
    hasStampPalette: computed((): boolean => state.stampPalettes.length > 0)
  })

  return { stampSetState: state }
}

export default useStampSetSelector
