import { computed, Ref } from 'vue'
import store from '/@/vuex'
import { StampId } from '/@/types/entity-ids'
import { StampSet } from './stampSetSelector'
import useStampFilter from './stampFilter'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const stampIds = computed((): readonly StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return store.getters.domain.me.recentStampIds
    }
    if (currentStampSet.value.type === 'palette') {
      const id = currentStampSet.value.id
      const stampPalette = store.state.entities.stampPalettesMap.get(id)
      return stampPalette?.stamps ?? []
    }
    if (currentStampSet.value.type === 'category') {
      const traQStampCategory =
        store.state.domain.stampCategory.traQStampCategory
      const unicodeStampCategories =
        store.state.domain.stampCategory.unicodeStampCategories
      const name = currentStampSet.value.id
      if (name === traQStampCategory.name) {
        return traQStampCategory.stampIds
      }
      return (
        unicodeStampCategories.find(
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
