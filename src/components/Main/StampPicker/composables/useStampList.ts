import type { Ref } from 'vue'
import { computed, shallowRef, watch } from 'vue'

import { isDefined } from '/@/lib/basic/array'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useTopStampIds } from '/@/store/domain/stampRecommendations'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampId } from '/@/types/entity-ids'

import useStampFilter from './useStampFilter'
import type { StampSet } from './useStampSetSelector'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { featureFlags } = useFeatureFlagSettings()
  const { topStampIds, topStampIdsFetched } = useTopStampIds()
  const { stampsMap } = useStampsStore()
  const { stampPalettesMap } = useStampPalettesStore()
  const { filterState } = useStampFilter()
  const shouldFreezeTopStampIds = computed(
    () =>
      featureFlags.value.stamp_recommendation_v2.enabled &&
      currentStampSet.value.type === 'history' &&
      filterState.query === ''
  )

  const initialTopStampIds = shallowRef<readonly StampId[]>()
  watch(
    [shouldFreezeTopStampIds, topStampIds, topStampIdsFetched],
    ([shouldFreeze, ids, fetched]) => {
      if (!shouldFreeze) {
        initialTopStampIds.value = undefined
        return
      }
      if (initialTopStampIds.value !== undefined || !fetched) return
      initialTopStampIds.value = [...ids]
    },
    { immediate: true, flush: 'sync' }
  )

  const stampIds = computed((): readonly StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return initialTopStampIds.value ?? topStampIds.value
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
