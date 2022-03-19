import { computed, Ref } from 'vue'
import { StampId } from '/@/types/entity-ids'
import { StampSet } from './useStampSetSelector'
import useStampFilter from './useStampFilter'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import { useStampHistory } from '/@/store/domain/stampHistory'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { recentStampIds } = useStampHistory()
  const { stampsMap } = useStampsStore()
  const { stampPalettesMap } = useStampPalettesStore()

  const stampIds = computed((): readonly StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return recentStampIds.value
    }
    if (currentStampSet.value.type === 'palette') {
      const id = currentStampSet.value.id
      const stampPalette = stampPalettesMap.value.get(id)
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
      return stampIds.value.map(id => stampsMap.value.get(id)!)
    }
    return filterState.filteredItems
  })

  return { stamps, filterState }
}

export default useStampList
