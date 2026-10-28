import type { Ref } from 'vue'
import { computed, shallowRef, watch } from 'vue'

import { isDefined } from '/@/lib/basic/array'
import { useStampCategory } from '/@/store/domain/stampCategory'
import { useTopStampIds } from '/@/store/domain/stampRecommendations'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampId } from '/@/types/entity-ids'

import useStampFilter from './useStampFilter'
import type { StampSet } from './useStampSetSelector'

const useStampList = (currentStampSet: Ref<StampSet>) => {
  const { traQStampCategory, unicodeStampCategories } = useStampCategory()
  const { topStampIds } = useTopStampIds()
  const { stampsMap } = useStampsStore()
  const { stampPalettesMap } = useStampPalettesStore()

  // ピッカーは開くたびにマウントされるため、最初の一覧を保持して並び替えを防ぐ。
  // 初回取得前に開いた場合は、一覧が届いてから固定する。
  const initialTopStampIds = shallowRef<readonly StampId[]>([])
  watch(
    topStampIds,
    ids => {
      if (initialTopStampIds.value.length > 0) return
      initialTopStampIds.value = [...ids]
    },
    { immediate: true }
  )

  const stampIds = computed((): readonly StampId[] => {
    if (currentStampSet.value.type === 'history') {
      return initialTopStampIds.value
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
      return stampIds.value.map(id => stampsMap.value.get(id)).filter(isDefined)
    }
    return filterState.filteredItems
  })

  return { stamps, filterState }
}

export default useStampList
