import { computed, Ref } from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { StampSet } from './stampSetSelector'

import useTextFilter from '@/use/textFilter'

const useStampList = (
  currentStampSet: Ref<StampSet>,
  queryString: Ref<string>
) => {
  const stampIds = computed((): StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return store.getters.domain.me.recentStampIds
    }
    if (currentStampSet.value.type === 'palette') {
      const id = currentStampSet.value.id
      const stampPalette = store.state.entities.stampPalettes[id]
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
  const stamps = computed(() => {
    if (queryString.value !== '') {
      const allStamps = computed(() =>
        Object.values(store.state.entities.stamps)
      )
      const { textFilterState, setQuery } = useTextFilter(allStamps, 'name')
      setQuery(queryString.value)
      return textFilterState.filteredItems
    }
    return stampIds.value.map(id => store.state.entities.stamps[id])
  })
  return { stamps }
}

export default useStampList
