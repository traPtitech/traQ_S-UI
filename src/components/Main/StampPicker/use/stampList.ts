import { computed, Ref } from 'vue'
import store from '/@/vuex'
import { StampId } from '/@/types/entity-ids'
import { StampSet } from './stampSetSelector'
import useStampFilter from './stampFilter'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useMeStore } from '/@/store/domain/me'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { recentStampIds } = useMeStore()

  const stampIds = computed((): readonly StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return recentStampIds.value
    }
    if (currentStampSet.value.type === 'palette') {
      const id = currentStampSet.value.id
      const stampPalette = store.state.entities.stampPalettesMap.get(id)
      return stampPalette?.stamps ?? []
    }
    if (currentStampSet.value.type === 'category') {
      const name = currentStampSet.value.id
      if (name === traQStampCategory.value.name) {
        return traQStampCategory.value.stampIds
      }
      return (
        unicodeStampCategories.value.find(
          category => name === `unicode-${category.name}`
        )?.stampIds ?? []
      )
    }
    return []
  })
  const { filterState } = useStampFilter()

  const stamps = computed(() => {
    if (filterState.query === '') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return stampIds.value.map(id => store.state.entities.stampsMap.get(id)!)
    }
    return filterState.filteredItems
  })

  return { stamps, filterState }
}

export default useStampList
