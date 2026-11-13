import type { Ref } from 'vue'
import { computed, shallowRef, watch } from 'vue'

import { isDefined } from '/@/lib/basic/array'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampSet } from '/@/store/ui/stampPickerSettings'
import type { StampId } from '/@/types/entity-ids'

import useStampFilter from './useStampFilter'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { stampRecommendations, stampRecommendationsFetched } =
    useStampRecommendations()
  const { recentStampIds } = useStampHistory()
  const { stampsMap, stampsMapFetched } = useStampsStore()
  const { stampPalettesMap } = useStampPalettesStore()
  const { filterState } = useStampFilter()
  const shouldFreezeRecommendations = computed(
    () =>
      currentStampSet.value.type === 'recommendation' &&
      filterState.query === ''
  )

  const initialRecommendations = shallowRef<readonly StampId[]>()
  watch(
    [
      shouldFreezeRecommendations,
      stampRecommendations,
      stampRecommendationsFetched,
      stampsMapFetched
    ],
    ([shouldFreeze, ids, recommendationsFetched, stampsFetched]) => {
      if (!shouldFreeze) {
        initialRecommendations.value = undefined
        return
      }

      if (
        initialRecommendations.value === undefined &&
        recommendationsFetched &&
        stampsFetched
      ) {
        initialRecommendations.value = [...ids]
      }
    },
    { immediate: true, flush: 'sync' }
  )

  const stampIds = computed((): readonly StampId[] => {
    if (currentStampSet.value.type === 'recommendation') {
      return initialRecommendations.value ?? stampRecommendations.value
    }

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

  const stamps = computed(() => {
    if (filterState.query === '') {
      return stampIds.value.map(id => stampsMap.value.get(id)).filter(isDefined)
    }

    return filterState.filteredItems
  })

  return { stamps, filterState }
}

export default useStampList
