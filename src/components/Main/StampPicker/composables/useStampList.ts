import type { Ref } from 'vue'
import { computed } from 'vue'

import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampId } from '/@/types/entity-ids'

import useStampFilter from './useStampFilter'
import type { StampSet } from './useStampSetSelector'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { recentStampIds } = useStampHistory()
  const { stampRecommendations } = useStampRecommendations()
  const { stampsMap } = useStampsStore()
  const { stampPalettesMap } = useStampPalettesStore()
  const { featureFlags } = useFeatureFlagSettings()

  const stampIds = computed((): readonly StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return featureFlags.value.stamp_recommendation.enabled
        ? stampRecommendations.value
        : recentStampIds.value
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
